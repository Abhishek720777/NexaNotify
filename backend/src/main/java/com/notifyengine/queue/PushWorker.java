package com.notifyengine.queue;

import com.notifyengine.channel.PushSender;
import com.notifyengine.notification.NotificationLog;
import com.notifyengine.notification.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class PushWorker {

    private final RedisQueueService queueService;
    private final PushSender pushSender;
    private final NotificationLogRepository logRepository;

    @Scheduled(fixedDelayString = "${queue.poll-interval-ms:1000}")
    public void pollQueue() {
        NotificationJob job = queueService.popJob("PUSH");
        if (job != null) {
            log.info("PushWorker processing job {}", job.getLogId());
            processJob(job);
        }
    }

    private void processJob(NotificationJob job) {
        job.setAttemptCount(job.getAttemptCount() + 1);
        boolean success = pushSender.send(job);

        NotificationLog dbLog = logRepository.findById(job.getLogId()).orElse(null);
        if (dbLog != null) {
            dbLog.setAttemptCount(job.getAttemptCount());
            dbLog.setLastAttemptedAt(LocalDateTime.now());

            if (success) {
                dbLog.setStatus("SENT");
                dbLog.setDeliveredAt(LocalDateTime.now());
                dbLog.setProviderResponse("Success");
            } else {
                if (job.getAttemptCount() >= 5) {
                    dbLog.setStatus("DEAD");
                } else {
                    dbLog.setStatus("RETRYING");
                    queueService.requeueWithBackoff(job);
                }
                dbLog.setProviderResponse("Failed");
            }
            logRepository.save(dbLog);
        }
    }
}
