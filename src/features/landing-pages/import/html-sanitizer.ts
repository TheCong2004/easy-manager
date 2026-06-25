/**
 * Lọc và loại bỏ các thành phần nguy hại (XSS, script độc hại) từ mã HTML nguồn.
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") {
    // Dự phòng bằng Regex nếu chạy ở môi trường Node.js Serverless mà không có DOMParser
    return fallbackRegexSanitize(html);
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    // Thực hiện khử độc trên toàn bộ tài liệu
    sanitizeElement(doc.body);
    if (doc.head) {
      sanitizeElement(doc.head);
    }
    
    // Trả về HTML đã lọc sạch
    return doc.documentElement.innerHTML;
  } catch (err) {
    console.error("DOMParser sanitize failed, using regex fallback:", err);
    return fallbackRegexSanitize(html);
  }
}

/**
 * Quét DOM và xóa bỏ script, inline event handler và javascript: links trên phần tử.
 */
export function sanitizeElement(root: HTMLElement): void {
  // 1. Loại bỏ tất cả các thẻ script nguy hiểm
  const scripts = Array.from(root.querySelectorAll("script"));
  for (const script of scripts) {
    script.parentNode?.removeChild(script);
  }

  // 2. Loại bỏ các thẻ nhúng mã nguồn bên ngoài nguy hiểm (embed, object)
  const embeds = Array.from(root.querySelectorAll("embed, object"));
  for (const el of embeds) {
    el.parentNode?.removeChild(el);
  }

  // 3. Quét tất cả các tag con để làm sạch thuộc tính
  const allElements = Array.from(root.querySelectorAll("*")) as HTMLElement[];
  
  // Đưa cả phần tử gốc vào danh sách quét
  allElements.push(root);

  for (const el of allElements) {
    // 3.1 Xóa tất cả các thuộc tính sự kiện inline (bắt đầu bằng "on" như onclick, onerror, onload...)
    const attrsToRemove: string[] = [];
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      if (attr.name.toLowerCase().startsWith("on")) {
        attrsToRemove.push(attr.name);
      }
    }
    for (const attrName of attrsToRemove) {
      el.removeAttribute(attrName);
    }

    // 3.2 Lọc liên kết javascript: độc hại
    const href = el.getAttribute("href");
    if (href && href.trim().toLowerCase().startsWith("javascript:")) {
      el.setAttribute("href", "#");
    }

    const src = el.getAttribute("src");
    if (src && src.trim().toLowerCase().startsWith("javascript:")) {
      el.removeAttribute("src");
    }

    const action = el.getAttribute("action");
    if (action && action.trim().toLowerCase().startsWith("javascript:")) {
      el.removeAttribute("action");
    }
    
    // 3.3 Chặn iframe load script lạ hoặc gỡ bỏ sandboxing
    if (el.tagName.toLowerCase() === "iframe") {
      el.setAttribute("sandbox", "allow-same-origin allow-scripts");
    }
  }
}

/**
 * Bộ lọc dự phòng bằng Regex để xử lý chuỗi thô khi không có môi trường DOM trình duyệt.
 */
function fallbackRegexSanitize(html: string): string {
  let cleaned = html;
  
  // Xóa bỏ hoàn toàn cặp thẻ <script>...</script>
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  // Xóa bỏ các cặp thẻ nhúng <embed> và <object>
  cleaned = cleaned.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "");
  cleaned = cleaned.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  
  // Xóa bỏ các inline event handler (ví dụ: onclick="...", onerror=...)
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*(['"]).*?\1/gi, "");
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*[^>\s]+/gi, "");
  
  // Chặn giao thức javascript: trong liên kết
  cleaned = cleaned.replace(/href\s*=\s*(['"])javascript:.*?\1/gi, 'href="#"');
  cleaned = cleaned.replace(/src\s*=\s*(['"])javascript:.*?\1/gi, 'src=""');
  cleaned = cleaned.replace(/action\s*=\s*(['"])javascript:.*?\1/gi, 'action=""');
  
  return cleaned;
}
export default sanitizeHtml;
