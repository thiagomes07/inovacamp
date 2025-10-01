export interface ShareData {
  title: string;
  text: string;
  url?: string;
}

export class ShareUtils {
  static async shareViaWhatsApp(data: ShareData, phoneNumber?: string): Promise<void> {
    const message = `${data.title}\n\n${data.text}${data.url ? `\n\n${data.url}` : ''}`;
    const encodedMessage = encodeURIComponent(message);
    
    let whatsappUrl = '';
    
    if (phoneNumber) {
      // Clean phone number and ensure it has country code
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const phone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    } else {
      whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    }
    
    window.open(whatsappUrl, '_blank');
  }

  static async shareViaTelegram(data: ShareData): Promise<void> {
    const telegramUrl = data.url 
      ? `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.text)}`
      : `https://t.me/share/msg?text=${encodeURIComponent(`${data.title}\n\n${data.text}`)}`;
    
    window.open(telegramUrl, '_blank');
  }

  static async shareViaEmail(data: ShareData): Promise<void> {
    const subject = encodeURIComponent(data.title);
    const body = encodeURIComponent(`${data.text}${data.url ? `\n\n${data.url}` : ''}`);
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    
    window.open(emailUrl, '_blank');
  }

  static async shareViaTwitter(data: ShareData): Promise<void> {
    const text = data.url 
      ? `${data.text} ${data.url}`
      : `${data.title}\n\n${data.text}`;
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  }

  static async shareViaNativeAPI(data: ShareData): Promise<boolean> {
    if (!navigator.share) {
      return false;
    }

    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url
      });
      return true;
    } catch (error) {
      console.error('Native share failed:', error);
      return false;
    }
  }

  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
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
      console.error('Copy to clipboard failed:', error);
      return false;
    }
  }

  static generatePIXShareMessage(amount: number, pixKey: string, description?: string): ShareData {
    return {
      title: '💰 PIX Payment - Swapin',
      text: `🎯 PIX Payment Request\n\n` +
            `💵 Amount: R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
            `🔑 PIX Key: ${pixKey}\n` +
            `${description ? `📝 Description: ${description}\n` : ''}` +
            `\n"Modern by nature, invincible by choice. We are Swapin." 🚀`,
      url: undefined
    };
  }

  static generateTransactionShareMessage(
    type: 'deposit' | 'loan' | 'investment' | 'pix',
    amount: number,
    currency: string,
    txId: string
  ): ShareData {
    const typeEmoji = {
      deposit: '📥',
      loan: '💰',
      investment: '📈',
      pix: '⚡'
    };

    const typeText = {
      deposit: 'Deposit',
      loan: 'Loan',
      investment: 'Investment',
      pix: 'PIX Transfer'
    };

    return {
      title: `${typeEmoji[type]} ${typeText[type]} Success - Swapin`,
      text: `✅ ${typeText[type]} Completed Successfully!\n\n` +
            `💵 Amount: ${currency === 'BRL' ? 'R$' : ''} ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${currency}\n` +
            `🆔 Transaction: ${txId}\n` +
            `📅 Date: ${new Date().toLocaleDateString('pt-BR')}\n\n` +
            `"Modern by nature, invincible by choice. We are Swapin." 🚀`,
      url: undefined
    };
  }

  static detectMobileApp(userAgent: string = navigator.userAgent): {
    isWhatsApp: boolean;
    isTelegram: boolean;
    isMobile: boolean;
  } {
    return {
      isWhatsApp: /WhatsApp/i.test(userAgent),
      isTelegram: /Telegram/i.test(userAgent),
      isMobile: /Mobi|Android/i.test(userAgent)
    };
  }

  static async smartShare(data: ShareData, preferredMethod?: 'whatsapp' | 'telegram' | 'native'): Promise<void> {
    const detection = this.detectMobileApp();

    // Try preferred method first
    if (preferredMethod === 'whatsapp') {
      return this.shareViaWhatsApp(data);
    }
    
    if (preferredMethod === 'telegram') {
      return this.shareViaTelegram(data);
    }

    if (preferredMethod === 'native') {
      const success = await this.shareViaNativeAPI(data);
      if (success) return;
    }

    // Fallback logic based on device/app detection
    if (detection.isWhatsApp) {
      return this.shareViaWhatsApp(data);
    }

    if (detection.isTelegram) {
      return this.shareViaTelegram(data);
    }

    if (detection.isMobile) {
      const success = await this.shareViaNativeAPI(data);
      if (success) return;
    }

    // Final fallback - copy to clipboard
    const fullText = `${data.title}\n\n${data.text}${data.url ? `\n\n${data.url}` : ''}`;
    const copied = await this.copyToClipboard(fullText);
    
    if (!copied) {
      throw new Error('All share methods failed');
    }
  }
}