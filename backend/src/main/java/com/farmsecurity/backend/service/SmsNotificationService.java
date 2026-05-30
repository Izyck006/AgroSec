package com.farmsecurity.backend.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsNotificationService {

    // These pull the exact credentials you just pasted into application.properties!
    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String twilioNumber;

    @Value("${farmer.phone.number}")
    private String farmerNumber;

    // This wakes up the Twilio connection the moment you start your Java server
    @PostConstruct
    public void initTwilio() {
        Twilio.init(accountSid, authToken);
    }

    // This is the method we will call when an animal is detected
    public void sendIntrusionAlert(String threatType, double confidence) {
        String alertText = String.format(
            "🚨 AGROSEC ALERT: %s detected at the perimeter! (Confidence: %.1f%%). Check dashboard immediately.", 
            threatType.toUpperCase(), 
            confidence
        );

        try {
            Message message = Message.creator(
                    new PhoneNumber(farmerNumber), // Who is receiving the text?
                    new PhoneNumber(twilioNumber), // Who is sending the text?
                    alertText
            ).create();
            
            System.out.println("[INFO] SMS Alert sent successfully. Twilio SID: " + message.getSid());
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to send SMS: " + e.getMessage());
        }
    }
}