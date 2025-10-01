export interface ReceiptData {
  transactionId: string;
  amount: number;
  currency: string;
  usdcReceived: number;
  exchangeRate: number;
  method: string;
  timestamp: string;
  fee: number;
  userInfo: {
    name: string;
    email: string;
  };
  accountInfo?: {
    bank: string;
    type: string;
    number: string;
  };
}

export interface PublicReceipt extends ReceiptData {
  publicId: string;
  publicUrl: string;
  qrCode: string;
  shareUrl: string;
  expiresAt: string;
}

class ReceiptGeneratorService {
  private baseUrl = 'https://swapin.app'; // Production URL
  private receipts = new Map<string, ReceiptData>();

  generatePublicReceipt(receiptData: ReceiptData): PublicReceipt {
    const publicId = this.generatePublicId();
    const publicUrl = `${this.baseUrl}/receipt/${publicId}`;
    const qrCode = this.generateQRCode(publicUrl);
    const shareUrl = this.generateShareUrl(publicUrl, receiptData);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    // Store receipt data (in production, this would be stored in a database)
    this.receipts.set(publicId, receiptData);

    return {
      ...receiptData,
      publicId,
      publicUrl,
      qrCode,
      shareUrl,
      expiresAt
    };
  }

  private generatePublicId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`.toUpperCase();
  }

  private generateQRCode(url: string): string {
    // Generate QR code data URL (in production, use a QR code library)
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  }

  private generateShareUrl(publicUrl: string, receiptData: ReceiptData): string {
    const message = this.generateShareMessage(receiptData);
    return `${publicUrl}?share=${encodeURIComponent(message)}`;
  }

  private generateShareMessage(receiptData: ReceiptData): string {
    return `💰 Swapin Transaction Receipt\n\n` +
           `✅ Successfully deposited R$ ${receiptData.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
           `🎯 Received: ${receiptData.usdcReceived.toFixed(6)} USDC\n` +
           `📅 ${new Date(receiptData.timestamp).toLocaleDateString('pt-BR')}\n` +
           `🆔 Transaction: ${receiptData.transactionId}\n\n` +
           `"Modern by nature, invincible by choice. We are Swapin." 🚀`;
  }

  getReceipt(publicId: string): ReceiptData | null {
    return this.receipts.get(publicId) || null;
  }

  generateWhatsAppUrl(publicReceipt: PublicReceipt, phoneNumber?: string): string {
    const message = `🎉 *Swapin Transaction Successful!*\n\n` +
                   `💰 *Amount:* R$ ${publicReceipt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
                   `🎯 *Received:* ${publicReceipt.usdcReceived.toFixed(6)} USDC\n` +
                   `⚡ *Method:* ${publicReceipt.method}\n` +
                   `🆔 *Transaction ID:* ${publicReceipt.transactionId}\n` +
                   `📅 *Date:* ${new Date(publicReceipt.timestamp).toLocaleDateString('pt-BR')}\n\n` +
                   `📋 *View Receipt:* ${publicReceipt.publicUrl}\n\n` +
                   `_Modern by nature, invincible by choice. We are Swapin._ 🚀`;

    const encodedMessage = encodeURIComponent(message);
    
    if (phoneNumber) {
      // Remove non-numeric characters and ensure country code
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const phone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      return `https://wa.me/${phone}?text=${encodedMessage}`;
    }
    
    return `https://wa.me/?text=${encodedMessage}`;
  }

  generateTelegramUrl(publicReceipt: PublicReceipt): string {
    const message = `🎉 Swapin Transaction Successful!\n\n` +
                   `💰 Amount: R$ ${publicReceipt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
                   `🎯 Received: ${publicReceipt.usdcReceived.toFixed(6)} USDC\n` +
                   `⚡ Method: ${publicReceipt.method}\n` +
                   `🆔 Transaction: ${publicReceipt.transactionId}\n\n` +
                   `📋 View Receipt: ${publicReceipt.publicUrl}\n\n` +
                   `Modern by nature, invincible by choice. We are Swapin. 🚀`;

    return `https://t.me/share/url?url=${encodeURIComponent(publicReceipt.publicUrl)}&text=${encodeURIComponent(message)}`;
  }

  generateEmailUrl(publicReceipt: PublicReceipt): string {
    const subject = `Swapin Transaction Receipt - ${publicReceipt.transactionId}`;
    const body = `Dear User,\n\n` +
                `Your Swapin transaction has been completed successfully!\n\n` +
                `Transaction Details:\n` +
                `- Amount: R$ ${publicReceipt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
                `- Received: ${publicReceipt.usdcReceived.toFixed(6)} USDC\n` +
                `- Method: ${publicReceipt.method}\n` +
                `- Transaction ID: ${publicReceipt.transactionId}\n` +
                `- Date: ${new Date(publicReceipt.timestamp).toLocaleDateString('pt-BR')}\n\n` +
                `View your complete receipt here: ${publicReceipt.publicUrl}\n\n` +
                `Thank you for choosing Swapin!\n` +
                `"Modern by nature, invincible by choice. We are Swapin."\n\n` +
                `Best regards,\n` +
                `The Swapin Team`;

    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  generateTwitterUrl(publicReceipt: PublicReceipt): string {
    const message = `🎉 Just completed a transaction on @SwapinApp! ` +
                   `💰 Deposited R$ ${publicReceipt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ` +
                   `and received ${publicReceipt.usdcReceived.toFixed(2)} USDC ⚡\n\n` +
                   `Modern by nature, invincible by choice. #Swapin #DeFi #Crypto\n\n` +
                   `${publicReceipt.publicUrl}`;

    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
  }

  async copyToClipboard(publicReceipt: PublicReceipt): Promise<boolean> {
    const message = `🎉 Swapin Transaction Successful!\n\n` +
                   `💰 Amount: R$ ${publicReceipt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
                   `🎯 Received: ${publicReceipt.usdcReceived.toFixed(6)} USDC\n` +
                   `⚡ Method: ${publicReceipt.method}\n` +
                   `🆔 Transaction: ${publicReceipt.transactionId}\n\n` +
                   `📋 View Receipt: ${publicReceipt.publicUrl}\n\n` +
                   `Modern by nature, invincible by choice. We are Swapin. 🚀`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(message);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = message;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
}

export const receiptGenerator = new ReceiptGeneratorService();