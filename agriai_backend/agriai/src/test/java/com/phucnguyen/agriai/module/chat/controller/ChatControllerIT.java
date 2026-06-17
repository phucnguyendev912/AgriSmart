package com.phucnguyen.agriai.module.chat.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.phucnguyen.agriai.module.chat.dto.request.CreateChatSessionRequest;
import com.phucnguyen.agriai.module.chat.dto.response.ChatMessageResponse;
import com.phucnguyen.agriai.module.chat.dto.response.ChatSessionResponse;
import com.phucnguyen.agriai.module.chat.dto.response.SoftDeleteChatSessionResponse;
import com.phucnguyen.agriai.module.chat.enums.SenderType;
import com.phucnguyen.agriai.infrastructure.exception.GlobalExceptionHandler;
import com.phucnguyen.agriai.module.chat.service.ChatMessageService;
import com.phucnguyen.agriai.module.chat.service.ChatSessionService;
import com.phucnguyen.agriai.module.chat.service.ChatbotService;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
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
                objectMapper.findAndRegisterModules();
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
                                .thenReturn(ChatSessionResponse.builder().id(1).sessionTitle("New chat").build());

                mockMvc.perform(post("/api/chat/sessions")
                                .principal(principal)
                                .contentType("application/json")
                                .content(objectMapper.writeValueAsString(CreateChatSessionRequest.builder().build())))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").value(1));
        }

        @Test
        void getMessages_returnsPagedResults() throws Exception {
                when(chatMessageService.getMessages("farmer@example.com", 2, PageRequest.of(0, 20)))
                                .thenReturn(new PageImpl<>(List.of(ChatMessageResponse.builder().id(8)
                                                .senderType(SenderType.USER).messageContent("Hello").build()),
                                                PageRequest.of(0, 20), 1));

                mockMvc.perform(get("/api/chat/sessions/2/messages").principal(principal))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.content[0].id").value(8));
        }

        @Test
        void getMessages_clampsPageAndSize() throws Exception {
                when(chatMessageService.getMessages("farmer@example.com", 2, PageRequest.of(0, 50)))
                                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 50), 0));

                mockMvc.perform(get("/api/chat/sessions/2/messages")
                                .principal(principal)
                                .param("page", "-5")
                                .param("size", "5000"))
                                .andExpect(status().isOk());
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
}
