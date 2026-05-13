package com.phucnguyen.agriai.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.phucnguyen.agriai.dto.request.CreateChatSessionRequest;
import com.phucnguyen.agriai.dto.request.SendChatMessageRequest;
import com.phucnguyen.agriai.dto.response.ChatMessageResponse;
import com.phucnguyen.agriai.dto.response.ChatResponse;
import com.phucnguyen.agriai.dto.response.ChatSessionResponse;
import com.phucnguyen.agriai.dto.response.SoftDeleteChatSessionResponse;
import com.phucnguyen.agriai.enums.SenderType;
import com.phucnguyen.agriai.exception.GlobalExceptionHandler;
import com.phucnguyen.agriai.service.ChatMessageService;
import com.phucnguyen.agriai.service.ChatSessionService;
import com.phucnguyen.agriai.service.ChatbotService;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class ChatControllerIT {

        @Mock
        private ChatSessionService chatSessionService;
        @Mock
        private ChatMessageService chatMessageService;
        @Mock
        private ChatbotService chatbotService;

        private MockMvc mockMvc;
        private ObjectMapper objectMapper;
        private final Principal principal = () -> "farmer@example.com";

        @BeforeEach
        void setUp() {
                objectMapper = new ObjectMapper();
                // Cần đảm bảo ObjectMapper xử lý được Java 8 date/time nếu cần, nhưng ở đây tối
                // giản
                ChatController controller = new ChatController(chatSessionService, chatMessageService, chatbotService);
                mockMvc = MockMvcBuilders.standaloneSetup(controller)
                                .setControllerAdvice(new GlobalExceptionHandler())
                                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                                .build();
        }

        @Test
        void createSession_returnsCreated() throws Exception {
                when(chatSessionService.createSession(org.mockito.ArgumentMatchers.eq("farmer@example.com"),
                                org.mockito.ArgumentMatchers.any()))
                                .thenReturn(ChatSessionResponse.builder().id(1).sessionTitle("Phiên tư vấn mới")
                                                .build());

                mockMvc.perform(post("/api/chat/sessions")
                                .principal(principal)
                                .contentType("application/json")
                                .content(objectMapper.writeValueAsString(CreateChatSessionRequest.builder().build())))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").value(1));
        }

        @Test
        void getMessages_returnsPagedResults() throws Exception {
                when(chatMessageService.getMessages("farmer@example.com", 2,
                                org.springframework.data.domain.PageRequest.of(0, 20)))
                                .thenReturn(new PageImpl<>(List.of(ChatMessageResponse.builder().id(8)
                                                .senderType(SenderType.USER).messageContent("Xin chào").build())));

                mockMvc.perform(get("/api/chat/sessions/2/messages").principal(principal))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.content[0].id").value(8));
        }

        @Test
        void deleteSession_returnsSoftDeletePayload() throws Exception {
                when(chatSessionService.softDeleteSession("farmer@example.com", 3))
                                .thenReturn(SoftDeleteChatSessionResponse.builder().id(3).isDelete(true)
                                                .deletedAt(LocalDateTime.now()).build());

                mockMvc.perform(patch("/api/chat/sessions/3/delete").principal(principal))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.isDelete").value(true));
        }

        @Test
        void guestMessage_returnsChatResponse() throws Exception {
                when(chatbotService.chatAsGuest(org.mockito.ArgumentMatchers.any()))
                                .thenReturn(ChatResponse.builder()
                                                .messageId(9)
                                                .senderType(SenderType.AI)
                                                .messageContent("Xin chào, tôi có thể giúp gì?")
                                                .build());

                mockMvc.perform(post("/api/chat/guest/messages")
                                .contentType("application/json")
                                .content(objectMapper.writeValueAsString(
                                                SendChatMessageRequest.builder().messageContent("hello").build())))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.messageContent").exists());
        }
}
