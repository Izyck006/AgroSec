package com.farmsecurity.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class TelegramNotificationService {

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.chat.id}")
    private String chatId;

    public void sendIntrusionAlert(String threatType, double confidence) {
        // Format the message with some emojis and bold text
        String text = String.format("🚨 *AGROSEC ALERT* 🚨\n\n%s detected at the perimeter!\nConfidence: %.1f%%\n\nCheck the dashboard immediately.",
                threatType.toUpperCase(), confidence);

        // Build the Telegram API URL
        String urlString = String.format("https://api.telegram.org/bot%s/sendMessage?chat_id=%s&text=%s&parse_mode=Markdown",
                botToken, chatId, text);

        try {
            // Send the request
            RestTemplate restTemplate = new RestTemplate();
            restTemplate.getForObject(urlString, String.class);
            
            System.out.println("[INFO] Telegram Alert sent successfully.");
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to send Telegram message: " + e.getMessage());
        }
    }
}