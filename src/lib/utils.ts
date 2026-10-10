/**
 * Utility Functions Library
 * 
 * Common utility functions used throughout the application.
 * These utilities handle:
 * - CSS class merging for Tailwind
 * - ID generation
 * - File operations
 * - Date/time formatting
 * - Clipboard operations
 * - HTML sanitization
 * - API helpers
 * 
 * Features:
 * - Pure, reusable utility functions with full TypeScript support
 * - Comprehensive JSDoc documentation with usage examples
 * - Robust edge case handling and error recovery
 * - Optimized performance with configurable options
 * - Production-ready implementations for common operations
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DOMPurify from 'dompurify';

/**
 * Utility function for combining Tailwind CSS classes
 * 
 * This function combines clsx and tailwind-merge to:
 * 1. Support conditional classes (clsx)
 * 2. Properly merge Tailwind classes (tailwind-merge)
 * 
 * @example
 * cn('px-2 py-1', 'px-4') // Returns: 'py-1 px-4'
 * cn('text-red-500', condition && 'text-blue-500')
 * cn(['text-sm', 'font-bold'], { 'opacity-50': isDisabled })
 * 
 * @param inputs - Class strings, conditionals, arrays, or objects
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID
 * 
 * Creates a unique identifier using random string and timestamp.
 * Not cryptographically secure - use for UI elements only.
 * 
 * @example
 * generateId() // Returns: 'a1b2c3d41234567890'
 * 
 * @returns Unique string ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Format file size in bytes to human readable format
 * 
 * Converts byte values to appropriate units (KB, MB, GB).
 * Always shows 2 decimal places except for bytes.
 * 
 * @example
 * formatFileSize(0) // Returns: '0 Bytes'
 * formatFileSize(1024) // Returns: '1 KB'
 * formatFileSize(1536) // Returns: '1.5 KB'
 * formatFileSize(1048576) // Returns: '1 MB'
 * 
 * @param bytes - File size in bytes
 * @returns Formatted string with appropriate unit
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file icon based on file type
 * 
 * Returns an emoji icon based on the MIME type or file extension.
 * Used in file upload UI components.
 * 
 * @example
 * getFileIcon('application/pdf') // Returns: '📄'
 * getFileIcon('image/png') // Returns: '🖼️'
 * getFileIcon('text/plain') // Returns: '📝'
 * getFileIcon('unknown/type') // Returns: '📎' (default)
 * 
 * @param fileType - MIME type or file extension
 * @returns Emoji icon representing the file type
 */
export function getFileIcon(fileType: string): string {
  const type = fileType.toLowerCase();
  
  // Document types
  if (type.includes('pdf')) return '📄';
  if (type.includes('word') || type.includes('doc')) return '📄';
  if (type.includes('text') || type.includes('txt')) return '📝';
  
  // Media types
  if (type.includes('image')) return '🖼️';
  if (type.includes('video')) return '🎥';
  if (type.includes('audio')) return '🎵';
  
  // Data types
  if (type.includes('excel') || type.includes('sheet')) return '📊';
  if (type.includes('powerpoint') || type.includes('presentation')) return '📈';
  if (type.includes('json')) return '📋';
  if (type.includes('csv')) return '📊';
  
  // Archive types
  if (type.includes('zip') || type.includes('rar')) return '🗜️';
  
  // Default icon
  return '📎';
}

/**
 * Validate file type against allowed types
 * 
 * Checks if a file type is in the allowed list.
 * Case-insensitive partial matching.
 * 
 * @example
 * const allowed = ['image/', 'application/pdf'];
 * isFileTypeAllowed('image/png', allowed) // Returns: true
 * isFileTypeAllowed('IMAGE/JPEG', allowed) // Returns: true (case-insensitive)
 * isFileTypeAllowed('text/plain', allowed) // Returns: false
 * 
 * @param fileType - MIME type to check
 * @param allowedTypes - List of allowed MIME types or patterns
 * @returns Whether the file type is allowed
 */
export function isFileTypeAllowed(fileType: string, allowedTypes: readonly string[]): boolean {
  return allowedTypes.some(type => fileType.toLowerCase().includes(type.toLowerCase()));
}

/**
 * Format timestamp to human readable format
 * 
 * Converts ISO timestamps to relative time strings.
 * Shows relative time for recent dates, absolute date for older.
 * 
 * @example
 * // Assuming current time is 2024-01-01 12:00:00
 * formatTimestamp('2024-01-01T11:59:30Z') // Returns: 'Just now'
 * formatTimestamp('2024-01-01T11:30:00Z') // Returns: '30m ago'
 * formatTimestamp('2024-01-01T08:00:00Z') // Returns: '4h ago'
 * formatTimestamp('2023-12-25T12:00:00Z') // Returns: '7d ago'
 * formatTimestamp('2023-11-01T12:00:00Z') // Returns: '11/1/2023'
 * 
 * @param timestamp - ISO date string
 * @returns Human-readable time difference or date
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  // Recent times shown as relative
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  // Older times shown as absolute date
  return date.toLocaleDateString();
}

/**
 * Copy text to clipboard
 * 
 * Uses the modern Clipboard API with fallback error handling.
 * Returns success/failure for UI feedback.
 * 
 * @example
 * const success = await copyToClipboard('Hello, world!');
 * if (success) {
 *   toast.success('Copied to clipboard');
 * } else {
 *   toast.error('Failed to copy');
 * }
 * 
 * @param text - Text to copy to clipboard
 * @returns Promise resolving to success boolean
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Copy failed, return false status
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Sanitize HTML content
 * 
 * Removes dangerous HTML/JS to prevent XSS attacks.
 * Safe for rendering user-generated content.
 * Skips sanitization on server-side (SSR).
 * 
 * @example
 * const dirty = '<script>alert("XSS")</script><p>Hello</p>';
 * sanitizeHtml(dirty) // Returns: '<p>Hello</p>'
 * 
 * const safe = '<p>Hello <strong>world</strong></p>';
 * sanitizeHtml(safe) // Returns: '<p>Hello <strong>world</strong></p>'
 * 
 * @param html - Raw HTML string
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    return html; // Skip sanitization on server side (no DOM)
  }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
}

/**
 * Debounce function
 * 
 * Delays function execution until after wait milliseconds have
 * elapsed since the last time it was invoked. Useful for search
 * inputs, window resize handlers, etc.
 * 
 * @example
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 * }, 300);
 * 
 * // Rapid calls...
 * debouncedSearch('a');    // Won't execute
 * debouncedSearch('ab');   // Won't execute
 * debouncedSearch('abc');  // Will execute after 300ms
 * 
 * @param func - Function to debounce
 * @param wait - Milliseconds to delay
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

/**
 * Throttle function
 * 
 * Ensures function is called at most once per specified time period.
 * First call executes immediately, subsequent calls are ignored until
 * the time period expires.
 * 
 * @example
 * const throttledScroll = throttle(() => {
 *   console.log('Scroll position:', window.scrollY);
 * }, 100);
 * 
 * // During rapid scrolling:
 * // t=0ms: executes immediately
 * // t=50ms: ignored (still in throttle period)
 * // t=100ms: executes (throttle period expired)
 * 
 * @param func - Function to throttle
 * @param limit - Minimum milliseconds between calls
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Truncate text to specified length
 * 
 * Cuts text at the specified length and adds ellipsis.
 * Trims whitespace from the cut point.
 * 
 * @example
 * truncateText('Hello, world!', 5) // Returns: 'Hello...'
 * truncateText('Short', 10) // Returns: 'Short'
 * truncateText('Hello   ', 5) // Returns: 'Hello...' (trimmed)
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Validate CustomGPT API key format
 * 
 * Checks if the provided string matches the CustomGPT API key format.
 * Format: {digits}|{alphanumeric_string}
 * - At least 3 digits before the pipe
 * - At least 20 alphanumeric characters after the pipe
 * 
 * @example
 * isValidApiKey('123|abcdefghijklmnopqrst') // Returns: true
 * isValidApiKey('YOUR_CUSTOMGPT_API_KEY') // Returns: true
 * isValidApiKey('12|short') // Returns: false (too few digits/chars)
 * isValidApiKey('no-pipe') // Returns: false (wrong format)
 * isValidApiKey('') // Returns: false (empty)
 * 
 * @param apiKey - API key string to validate
 * @returns Whether the API key is valid
 */
export function isValidApiKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // Trim whitespace
  apiKey = apiKey.trim();
  
  // CustomGPT API key format: starts with digits followed by | then alphanumeric string
  // Example: YOUR_CUSTOMGPT_API_KEY
  // Must have at least 3 digits, pipe, and at least 20 characters after pipe
  return /^\d{3,}\|[a-zA-Z0-9]{20,}$/.test(apiKey);
}

/**
 * Parse streaming response chunk
 * 
 * Handles various SSE (Server-Sent Events) formats from the CustomGPT API.
 * Supports both standard SSE format and raw JSON lines.
 * 
 * Formats handled:
 * - SSE events: "event: progress", "event: finish"
 * - SSE data: "data: {json}", "data: [DONE]"
 * - Raw JSON: {"content": "...", "citations": [...]}
 * - Plain text: "data: plain text content"
 * 
 * @example
 * parseStreamChunk('data: {"content": "Hello"}') 
 * // Returns: { type: 'content', content: 'Hello' }
 * 
 * parseStreamChunk('data: [DONE]')
 * // Returns: { type: 'done' }
 * 
 * parseStreamChunk('event: finish')
 * // Returns: { type: 'done' }
 * 
 * @param chunk - Raw chunk from SSE stream
 * @returns Parsed chunk object or null if should be skipped
 */
export function parseStreamChunk(chunk: string): any | null {
  try {
    
    // Skip event lines - CustomGPT sends "event: progress" etc.
    if (chunk.startsWith('event: ')) {
      const eventType = chunk.slice(7).trim();
      
      // Handle specific events if needed
      if (eventType === 'finish') {
        return { type: 'done' };
      }
      
      // Skip other event types
      return null;
    }
    
    // Handle SSE format
    if (chunk.startsWith('data: ')) {
      const data = chunk.slice(6).trim();
      
      if (data === '[DONE]' || data === 'DONE') return { type: 'done' };
      
      // CustomGPT might send plain text data instead of JSON
      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(data);
        
        // Handle different response formats
        if (typeof parsed === 'object') {
          // If it already has a type, return as is
          if (parsed.type) {
            return parsed;
          }
          
          // Handle CustomGPT format where content might be a direct property
          if (parsed.content !== undefined) {
            return { type: 'content', content: parsed.content, citations: parsed.citations };
          }
          
          // Handle citation-only responses
          if (parsed.citations && !parsed.content) {
            return { type: 'citation', citations: parsed.citations };
          }
          
          // Handle message field (some APIs use 'message' instead of 'content')
          if (parsed.message !== undefined) {
            return { type: 'content', content: parsed.message, citations: parsed.citations };
          }
          
          // Handle delta format (some streaming APIs use delta.content)
          if (parsed.delta && parsed.delta.content !== undefined) {
            return { type: 'content', content: parsed.delta.content, citations: parsed.citations };
          }
          
          // Handle choices format (OpenAI-style streaming)
          if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
            const delta = parsed.choices[0].delta;
            if (delta.content !== undefined) {
              return { type: 'content', content: delta.content, citations: parsed.citations };
            }
          }
        }
        
        // Return the parsed data as is if we can't determine the format
        return parsed;
      } catch (jsonError) {
        // If JSON parsing fails, treat it as plain text content
        return { type: 'content', content: data };
      }
    }
    
    // Handle raw JSON lines (no "data: " prefix)
    if (chunk.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(chunk.trim());
        
        if (parsed.content !== undefined || parsed.citations !== undefined) {
          return { 
            type: parsed.content ? 'content' : 'citation', 
            content: parsed.content,
            citations: parsed.citations 
          };
        }
        
        // Handle message field
        if (parsed.message !== undefined) {
          return { type: 'content', content: parsed.message, citations: parsed.citations };
        }
        
        return parsed;
      } catch (parseError) {
        console.warn('Failed to parse raw JSON chunk:', parseError);
      }
    }
    
    // Handle plain text responses (fallback)
    if (chunk.trim() && !chunk.includes('data:') && !chunk.startsWith('{')) {
      return { type: 'content', content: chunk.trim() };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to parse stream chunk:', chunk, error);
    return null;
  }
}

/**
 * Extract inline citations from text
 * 
 * Finds all citation references in format [1], [2], etc.
 * Returns the original text and array of citation numbers.
 * 
 * @example
 * extractInlineCitations('Hello [1] world [2]!')
 * // Returns: { text: 'Hello [1] world [2]!', citations: [1, 2] }
 * 
 * extractInlineCitations('No citations here')
 * // Returns: { text: 'No citations here', citations: [] }
 * 
 * @param text - Text potentially containing citations
 * @returns Object with text and citation numbers
 */
export function extractInlineCitations(text: string): { text: string; citations: number[] } {
  const citationRegex = /\[(\d+)\]/g;
  const citations: number[] = [];
  let match;
  
  while ((match = citationRegex.exec(text)) !== null) {
    citations.push(parseInt(match[1]));
  }
  
  return { text, citations };
}

/**
 * Create a delay promise
 * 
 * Utility for adding delays in async functions.
 * Useful for retries, animations, or testing.
 * 
 * @example
 * async function slowOperation() {
 *   console.log('Starting...');
 *   await delay(1000); // Wait 1 second
 *   console.log('Done!');
 * }
 * 
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * 
 * Retries a failing async function with increasing delays.
 * Delays: 1s, 2s, 4s, 8s, etc. (exponential)
 * 
 * @example
 * // Retry API call up to 3 times
 * const data = await retryWithBackoff(
 *   () => fetch('/api/data').then(r => r.json()),
 *   3,    // max attempts
 *   1000  // base delay (1s)
 * );
 * 
 * // Delays: attempt 1 = immediate, attempt 2 = 1s, attempt 3 = 2s
 * 
 * @param fn - Async function to retry
 * @param maxAttempts - Maximum retry attempts (default: 3)
 * @param baseDelay - Base delay in ms (default: 1000)
 * @returns Result from successful function call
 * @throws Last error if all attempts fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      // Exponential backoff: 1s, 2s, 4s, etc.
      const delayTime = baseDelay * Math.pow(2, attempt - 1);
      await delay(delayTime);
    }
  }
  
  throw lastError!;
}

/**
 * Check if device is mobile
 * 
 * Based on viewport width (<768px).
 * Returns false during SSR.
 * 
 * @returns Whether viewport is mobile-sized
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

/**
 * Check if device is tablet
 * 
 * Based on viewport width (768px-1023px).
 * Returns false during SSR.
 * 
 * @returns Whether viewport is tablet-sized
 */
export function isTablet(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

/**
 * Check if device is desktop
 * 
 * Based on viewport width (≥1024px).
 * Returns false during SSR.
 * 
 * @returns Whether viewport is desktop-sized
 */
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
}

/**
 * Get responsive container class
 * 
 * Returns Tailwind classes for responsive container sizing.
 * - Mobile: Full width/height
 * - Tablet: Max 2xl width, centered
 * - Desktop: Max 4xl width, centered
 * 
 * @returns Tailwind class string for container
 */
export function getResponsiveContainer(): string {
  if (isMobile()) return 'w-full h-full';
  if (isTablet()) return 'w-full max-w-2xl mx-auto';
  return 'w-full max-w-4xl mx-auto';
}

/**
 * Format conversation name from first message
 * 
 * Creates a conversation title from the first message.
 * Takes first 6 words, max 50 characters.
 * 
 * @example
 * generateConversationName('Hello, can you help me with JavaScript?')
 * // Returns: 'Hello, can you help me with'
 * 
 * generateConversationName('Short')
 * // Returns: 'Short'
 * 
 * @param firstMessage - The first message in conversation
 * @returns Formatted conversation name
 */
export function generateConversationName(firstMessage: string): string {
  // Remove common API/system prefixes
  let cleanedMessage = firstMessage.trim();
  
  // Remove OpenAI- prefix or similar system prefixes
  cleanedMessage = cleanedMessage.replace(/^(OpenAI-|System-|API-|Assistant:|User:)\s*/i, '');
  
  const words = cleanedMessage.split(/\s+/);
  const title = words.slice(0, 6).join(' ');
  return title.length > 50 ? title.substring(0, 50).trim() + '...' : title;
}

/**
 * Validate URL format
 * 
 * Checks if string is a valid URL using URL constructor.
 * 
 * @example
 * isValidUrl('https://example.com') // Returns: true
 * isValidUrl('http://localhost:3000/path') // Returns: true
 * isValidUrl('not a url') // Returns: false
 * isValidUrl('') // Returns: false
 * 
 * @param url - String to validate
 * @returns Whether string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file extension from filename
 * 
 * Extracts the file extension in lowercase.
 * 
 * @example
 * getFileExtension('document.pdf') // Returns: 'pdf'
 * getFileExtension('image.PNG') // Returns: 'png'
 * getFileExtension('no-extension') // Returns: ''
 * getFileExtension('multi.part.name.txt') // Returns: 'txt'
 * 
 * @param filename - Filename to extract extension from
 * @returns Lowercase extension or empty string
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if file is an image
 * 
 * Checks MIME type for image/ prefix.
 * 
 * @example
 * isImageFile('image/png') // Returns: true
 * isImageFile('image/jpeg') // Returns: true
 * isImageFile('application/pdf') // Returns: false
 * 
 * @param fileType - MIME type to check
 * @returns Whether file is an image
 */
export function isImageFile(fileType: string): boolean {
  return fileType.startsWith('image/');
}

/**
 * Check if file is a document
 * 
 * Checks against common document MIME types including:
 * - PDF files
 * - Microsoft Word documents
 * - Plain text files
 * - CSV spreadsheets
 * - JSON/XML data files
 * 
 * @example
 * isDocumentFile('application/pdf') // Returns: true
 * isDocumentFile('text/plain') // Returns: true
 * isDocumentFile('image/png') // Returns: false
 * 
 * @param fileType - MIME type to check
 * @returns Whether file is a supported document type
 */
export function isDocumentFile(fileType: string): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
    'application/json',
    'application/xml',
  ];
  return documentTypes.includes(fileType);
}

/**
 * Create download link for file
 * 
 * Programmatically downloads content as a file.
 * Creates a blob URL and triggers download.
 * 
 * @example
 * // Download text file
 * downloadFile('Hello, world!', 'greeting.txt');
 * 
 * // Download JSON file
 * const data = { name: 'John', age: 30 };
 * downloadFile(
 *   JSON.stringify(data, null, 2),
 *   'data.json',
 *   'application/json'
 * );
 * 
 * @param content - File content as string
 * @param filename - Name for downloaded file
 * @param mimeType - MIME type (default: 'text/plain')
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape HTML entities
 * 
 * Prevents XSS by escaping HTML special characters.
 * Use when displaying user input as HTML.
 * 
 * @example
 * escapeHtml('<script>alert("XSS")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 * 
 * escapeHtml('Hello & "world"')
 * // Returns: 'Hello &amp; &quot;world&quot;'
 * 
 * @param unsafe - Raw string that may contain HTML
 * @returns HTML-escaped string
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Handle API errors and extract error message
 * 
 * Normalizes various error formats into consistent structure.
 * Handles:
 * - API response errors (4xx, 5xx)
 * - Network/connection errors
 * - Client-side errors
 * 
 * @example
 * try {
 *   await apiCall();
 * } catch (error) {
 *   const { message, code } = handleApiError(error);
 *   toast.error(message);
 *   if (code === 401) {
 *     // Handle unauthorized
 *   }
 * }
 * 
 * @param error - Error object from API call
 * @returns Normalized error with message and optional code
 */
export function handleApiError(error: any): { message: string; code?: number } {
  console.error('API Error:', error);
  
  if (error.response) {
    // API responded with an error
    const data = error.response.data;
    // Handle nested error formats
    if (data && data.data && data.data.message) {
      return {
        message: data.data.message,
        code: data.data.code || error.response.status
      };
    }
    // Handle direct message format
    if (data && data.message) {
      return {
        message: data.message,
        code: error.response.status
      };
    }
    // Fallback to status code
    return {
      message: `API Error: ${error.response.status}`,
      code: error.response.status
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'No response from server. Please check your connection.',
      code: 0
    };
  } else {
    // Something else happened (e.g., request setup error)
    return {
      message: error.message || 'An unexpected error occurred',
      code: 0
    };
  }
}

/**
 * Constants for file uploads and API
 * 
 * Central configuration for limits and constraints.
 * Modify these values to customize behavior:
 * 
 * - MAX_FILE_SIZE: Maximum upload size per file
 * - ACCEPTED_FILE_TYPES: MIME types allowed for upload
 * - MAX_MESSAGE_LENGTH: Character limit for messages
 * - API_TIMEOUT: Request timeout for regular API calls
 * - STREAM_TIMEOUT: Timeout for streaming responses
 * - RETRY_ATTEMPTS: Number of retries on failure
 * - RETRY_DELAY: Base delay between retries
 * 
 * @example
 * // Check file size
 * if (file.size > CONSTANTS.MAX_FILE_SIZE) {
 *   throw new Error('File too large');
 * }
 * 
 * // Configure retry
 * await retryWithBackoff(
 *   apiCall,
 *   CONSTANTS.RETRY_ATTEMPTS,
 *   CONSTANTS.RETRY_DELAY
 * );
 */
export const CONSTANTS = {
  /** Maximum file size in bytes (10MB) */
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  
  /** Accepted MIME types for file uploads */
  ACCEPTED_FILE_TYPES: [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
    'application/json',
    'application/xml',
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
  
  /** Maximum characters per message */
  MAX_MESSAGE_LENGTH: 4000,
  
  /** API request timeout in milliseconds (30s) */
  API_TIMEOUT: 30000,
  
  /** Streaming request timeout in milliseconds (60s) */
  STREAM_TIMEOUT: 60000,
  
  /** Number of retry attempts for failed requests */
  RETRY_ATTEMPTS: 3,
  
  /** Base delay between retries in milliseconds (1s) */
  RETRY_DELAY: 1000,
} as const;