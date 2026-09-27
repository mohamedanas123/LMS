package com.lms.app.service;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;
import org.springframework.stereotype.Service;

@Service
public class HtmlSanitizerService {

    // Construct a strict policy that strips <script>, <iframe>, event handlers (onload, onerror), javascript: pseudo-protocols
    // while allowing basic text formatting (bold, italic, lists, paragraphs)
    private final PolicyFactory policy;

    public HtmlSanitizerService() {
        this.policy = new HtmlPolicyBuilder()
                .allowElements("b", "i", "em", "strong", "u", "p", "br", "ul", "ol", "li", "code", "pre", "blockquote")
                .toFactory()
                .and(Sanitizers.FORMATTING)
                .and(Sanitizers.BLOCKS);
    }

    /**
     * Sanitizes untrusted user inputs to eliminate Stored XSS vectors.
     *
     * @param untrustedHtml raw user input
     * @return clean sanitized HTML / text
     */
    public String sanitize(String untrustedHtml) {
        if (untrustedHtml == null) {
            return null;
        }
        return policy.sanitize(untrustedHtml).trim();
    }
}
