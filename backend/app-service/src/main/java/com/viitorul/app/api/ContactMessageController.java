package com.viitorul.app.api;
import com.viitorul.app.dto.ContactMessageRequestDTO;
import com.viitorul.app.service.ContactMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/app/contact/messages")
@RequiredArgsConstructor
public class ContactMessageController {

    private final ContactMessageService contactMessageService;

    @PostMapping
    public ResponseEntity<Void> sendContactMessage(@Valid @RequestBody ContactMessageRequestDTO request) {
        contactMessageService.handle(request);
        return ResponseEntity.ok().build();
    }
}
