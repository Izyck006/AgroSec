package com.farmsecurity.backend.controller;

import com.farmsecurity.backend.model.Alert;
import com.farmsecurity.backend.repository.AlertRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AlertController.class)
class AlertControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AlertRepository alertRepository;

    @Test
    void getAllAlerts_returnsEmptyList() throws Exception {
        when(alertRepository.findAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/alerts"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getAllAlerts_returnsAlerts() throws Exception {
        Alert alert = new Alert();
        alert.setIntruderType("person");
        alert.setConfidence(92.5);

        when(alertRepository.findAll()).thenReturn(List.of(alert));

        mockMvc.perform(get("/api/alerts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].intruderType").value("person"))
                .andExpect(jsonPath("$[0].confidence").value(92.5));
    }

    @Test
    void getAllAlerts_limitsToTwenty() throws Exception {
        List<Alert> alerts = new ArrayList<>();
        for (int i = 0; i < 25; i++) {
            Alert a = new Alert();
            a.setIntruderType("person");
            a.setConfidence(90.0 + i);
            alerts.add(a);
        }
        when(alertRepository.findAll()).thenReturn(alerts);

        mockMvc.perform(get("/api/alerts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(20));
    }

    @Test
    void getAllAlerts_reversesOrder() throws Exception {
        Alert first = new Alert();
        first.setIntruderType("cow");
        first.setConfidence(80.0);

        Alert second = new Alert();
        second.setIntruderType("person");
        second.setConfidence(95.0);

        when(alertRepository.findAll()).thenReturn(new ArrayList<>(Arrays.asList(first, second)));

        mockMvc.perform(get("/api/alerts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].intruderType").value("person"))
                .andExpect(jsonPath("$[1].intruderType").value("cow"));
    }

    @Test
    void createAlert_savesAndReturnsAlert() throws Exception {
        Alert saved = new Alert();
        saved.setIntruderType("sheep");
        saved.setConfidence(87.5);

        when(alertRepository.save(any(Alert.class))).thenReturn(saved);

        String json = """
                {
                    "intruderType": "sheep",
                    "confidence": 87.5,
                    "imageData": "base64data"
                }
                """;

        mockMvc.perform(post("/api/alerts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.intruderType").value("sheep"))
                .andExpect(jsonPath("$.confidence").value(87.5));
    }

    @Test
    void createAlert_withMinimalPayload() throws Exception {
        Alert saved = new Alert();
        saved.setIntruderType("person");

        when(alertRepository.save(any(Alert.class))).thenReturn(saved);

        String json = """
                {
                    "intruderType": "person"
                }
                """;

        mockMvc.perform(post("/api/alerts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.intruderType").value("person"));
    }
}
