const BUSINESS_SHORT_LINK = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_LINK;
const BUSINESS_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER;

function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('254')) {
    return digits;
  }
  if (digits.startsWith('0')) {
    return `254${digits.slice(1)}`;
  }
  return digits;
}

export function buildWhatsAppLink(phone?: string | null, message?: string): string {
  const encodedMessage = message ? encodeURIComponent(message) : '';

  if (BUSINESS_SHORT_LINK) {
    return encodedMessage
      ? `${BUSINESS_SHORT_LINK}${BUSINESS_SHORT_LINK.includes('?') ? '&' : '?'}text=${encodedMessage}`
      : BUSINESS_SHORT_LINK;
  }

  const normalizedNumber = normalizePhone(phone) || normalizePhone(BUSINESS_NUMBER);
  if (!normalizedNumber) {
    return '';
  }

  return encodedMessage
    ? `https://wa.me/${normalizedNumber}?text=${encodedMessage}`
    : `https://wa.me/${normalizedNumber}`;
}
