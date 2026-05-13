package com.phucnguyen.agriai.controller;

import com.phucnguyen.agriai.dto.request.CreateChatSessionRequest;
import com.phucnguyen.agriai.dto.request.SendChatMessageRequest;
import com.phucnguyen.agriai.dto.response.ChatMessageResponse;
import com.phucnguyen.agriai.dto.response.ChatResponse;
import com.phucnguyen.agriai.dto.response.ChatSessionResponse;
import com.phucnguyen.agriai.dto.response.SoftDeleteChatSessionResponse;
import com.phucnguyen.agriai.service.ChatMessageService;
import com.phucnguyen.agriai.service.ChatSessionService;
import com.phucnguyen.agriai.service.ChatbotService;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatSessionService chatSessionService;
    private final ChatMessageService chatMessageService;
    private final ChatbotService chatbotService;

    public ChatController(
            ChatSessionService chatSessionService,
            ChatMessageService chatMessageService,
            ChatbotService chatbotService) {
        this.chatSessionService = chatSessionService;
        this.chatMessageService = chatMessageService;
        this.chatbotService = chatbotService;
    }

    @PostMapping("/sessions")
    public ResponseEntity<ChatSessionResponse> createSession(
            Principal principal,
            @RequestBody(required = false) CreateChatSessionRequest request) {
        ChatSessionResponse response = chatSessionService.createSession(principal != null ? principal.getName() : null,
                request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/sessions")
    public ResponseEntity<Page<ChatSessionResponse>> getSessions(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(chatSessionService.getSessions(principal != null ? principal.getName() : null, pageable));
    }

    @GetMapping("/sessions/{id}/messages")
    public ResponseEntity<Page<ChatMessageResponse>> getMessages(
            Principal principal,
            @PathVariable Integer id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity
                .ok(chatMessageService.getMessages(principal != null ? principal.getName() : null, id, pageable));
    }

    @PatchMapping("/sessions/{id}/delete")
    public ResponseEntity<SoftDeleteChatSessionResponse> deleteSession(Principal principal, @PathVariable Integer id) {
        return ResponseEntity.ok(chatSessionService.softDeleteSession(principal != null ? principal.getName() : null, id));
    }

    @PostMapping("/sessions/{id}/messages")
    public ResponseEntity<ChatResponse> sendMessage(
            Principal principal,
            @PathVariable Integer id,
            @Valid @RequestBody SendChatMessageRequest request) {
        return ResponseEntity.ok(chatbotService.chatForSession(principal != null ? principal.getName() : null, id, request));
    }

    @PostMapping("/guest/messages")
    public ResponseEntity<ChatResponse> sendGuestMessage(@Valid @RequestBody SendChatMessageRequest request) {
        return ResponseEntity.ok(chatbotService.chatAsGuest(request));
    }
}
