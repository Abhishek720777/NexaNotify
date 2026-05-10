package com.notifyengine.queue;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisQueueService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String DELAYED_QUEUE = "queue:delayed";

    public void pushJob(NotificationJob job) {
        String queueName = "queue:" + (job.getPriority() != null ? job.getPriority().toLowerCase() : "low");
        redisTemplate.opsForList().rightPush(queueName, job);
        log.info("Pushed job {} to {}", job.getLogId(), queueName);
    }

    public NotificationJob popJob(String channel) {
        // Try HIGH priority first
        Object job = redisTemplate.opsForList().leftPop("queue:high");
        if (job == null) {
            // Fallback to LOW priority
            job = redisTemplate.opsForList().leftPop("queue:low");
        }

        if (job instanceof NotificationJob nJob) {
            if (nJob.getChannel().equalsIgnoreCase(channel)) {
                return nJob;
            } else {
                // Not for this channel worker, push it back to the end
                pushJob(nJob);
            }
        }
        return null;
    }

    public void requeueWithBackoff(NotificationJob job) {
        int attempt = job.getAttemptCount();
        if (attempt >= 5) {
            log.error("Job {} reached max attempts (5), marking DEAD.", job.getLogId());
            return;
        }

        long delaySeconds = (long) Math.pow(2, attempt);
        long executeAt = System.currentTimeMillis() + (delaySeconds * 1000);
        
        redisTemplate.opsForZSet().add(DELAYED_QUEUE, job, executeAt);
        log.info("Job {} scheduled for retry in {}s", job.getLogId(), delaySeconds);
    }

    @org.springframework.scheduling.annotation.Scheduled(fixedDelay = 1000)
    public void pollDelayedJobs() {
        long now = System.currentTimeMillis();
        java.util.Set<Object> jobs = redisTemplate.opsForZSet().rangeByScore(DELAYED_QUEUE, 0, now);
        
        if (jobs != null && !jobs.isEmpty()) {
            for (Object job : jobs) {
                if (job instanceof NotificationJob nJob) {
                    redisTemplate.opsForZSet().remove(DELAYED_QUEUE, job);
                    pushJob(nJob);
                    log.info("Moved job {} from delayed to active queue", nJob.getLogId());
                }
            }
        }
    }
}
