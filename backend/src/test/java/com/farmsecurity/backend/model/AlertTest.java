package com.farmsecurity.backend.model;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class AlertTest {

    @Test
    void testDefaultValues() {
        Alert alert = new Alert();
        assertNull(alert.getId());
        assertNull(alert.getIntruderType());
        assertEquals(0.0, alert.getConfidence());
        assertNotNull(alert.getTimestamp());
        assertEquals("Intrusion Detected", alert.getStatus());
        assertNull(alert.getImageData());
    }

    @Test
    void testSetAndGetIntruderType() {
        Alert alert = new Alert();
        alert.setIntruderType("person");
        assertEquals("person", alert.getIntruderType());
    }

    @Test
    void testSetAndGetConfidence() {
        Alert alert = new Alert();
        alert.setConfidence(95.5);
        assertEquals(95.5, alert.getConfidence(), 0.001);
    }

    @Test
    void testSetAndGetImageData() {
        Alert alert = new Alert();
        String base64 = "iVBORw0KGgoAAAANSUhEUg==";
        alert.setImageData(base64);
        assertEquals(base64, alert.getImageData());
    }

    @Test
    void testTimestampIsCloseToNow() {
        Alert alert = new Alert();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime alertTime = alert.getTimestamp();
        // Timestamp should be within 2 seconds of now
        assertTrue(alertTime.isBefore(now.plusSeconds(2)));
        assertTrue(alertTime.isAfter(now.minusSeconds(2)));
    }

    @Test
    void testMultipleFieldsSetTogether() {
        Alert alert = new Alert();
        alert.setIntruderType("cow");
        alert.setConfidence(88.3);
        alert.setImageData("data123");

        assertEquals("cow", alert.getIntruderType());
        assertEquals(88.3, alert.getConfidence(), 0.001);
        assertEquals("data123", alert.getImageData());
        assertEquals("Intrusion Detected", alert.getStatus());
    }

    @Test
    void testSetIntruderTypeToNull() {
        Alert alert = new Alert();
        alert.setIntruderType("sheep");
        alert.setIntruderType(null);
        assertNull(alert.getIntruderType());
    }

    @Test
    void testSetConfidenceToZero() {
        Alert alert = new Alert();
        alert.setConfidence(99.0);
        alert.setConfidence(0.0);
        assertEquals(0.0, alert.getConfidence(), 0.001);
    }
}
