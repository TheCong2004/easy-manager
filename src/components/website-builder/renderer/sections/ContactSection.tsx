import React from "react";
import { ContactProps } from "../types";

export const ContactSection: React.FC<ContactProps> = ({
  sectionId,
  mode = "preview",
  onFieldClick,
  title,
  subtitle,
  buttonText,
  namePlaceholder = "Họ và tên của bạn",
  emailPlaceholder = "Địa chỉ email liên hệ",
  primaryColor,
}) => {
  const isEdit = mode === "edit";
  const displayTitle = title || "Liên hệ với chúng tôi";
  const displaySubtitle = subtitle || "Hãy để lại thông tin và chuyên gia của chúng tôi sẽ phản hồi lại ngay.";
  const displayButtonText = buttonText || "Gửi yêu cầu liên hệ";

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEdit) {
      alert("Cảm ơn bạn đã để lại thông tin! Chúng tôi sẽ phản hồi lại sớm nhất.");
    }
  };

  return (
    <section className="py-16 px-6 bg-zinc-50 dark:bg-boxdark text-black dark:text-white text-center">
      <div className="max-w-md mx-auto">
        {isEdit ? (
          <h2
            onClick={() => onFieldClick?.(sectionId, "title", displayTitle)}
            className="text-2xl font-bold sm:text-3xl cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 p-1.5 rounded transition"
          >
            {displayTitle}
          </h2>
        ) : (
          <h2 className="text-2xl font-bold sm:text-3xl">{displayTitle}</h2>
        )}

        {isEdit ? (
          <p
            onClick={() => onFieldClick?.(sectionId, "subtitle", displaySubtitle)}
            className="text-gray-500 dark:text-gray-400 text-sm mt-2 mb-8 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 p-1 rounded transition"
          >
            {displaySubtitle}
          </p>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 mb-8">{displaySubtitle}</p>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <input
            type="text"
            placeholder={namePlaceholder}
            className="w-full rounded border border-gray-200 dark:border-strokedark py-3 px-4 outline-none text-sm focus:border-primary bg-white dark:bg-meta-4 text-black dark:text-white"
            disabled={isEdit}
            required={!isEdit}
          />
          <input
            type="email"
            placeholder={emailPlaceholder}
            className="w-full rounded border border-gray-200 dark:border-strokedark py-3 px-4 outline-none text-sm focus:border-primary bg-white dark:bg-meta-4 text-black dark:text-white"
            disabled={isEdit}
            required={!isEdit}
          />

          {isEdit ? (
            <button
              type="button"
              onClick={() => onFieldClick?.(sectionId, "buttonText", displayButtonText)}
              className="w-full text-white font-bold py-3 rounded text-sm transition-all shadow-md hover:shadow-lg"
              style={{ backgroundColor: primaryColor || "#3B82F6" }}
            >
              {displayButtonText}
            </button>
          ) : (
            <button
              type="submit"
              className="w-full text-white font-bold py-3 rounded text-sm transition-all shadow-md hover:shadow-lg"
              style={{ backgroundColor: primaryColor || "#3B82F6" }}
            >
              {displayButtonText}
            </button>
          )}
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
