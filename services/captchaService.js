const axios = require('axios');
const fs = require('fs');
const path = require('path');

class CaptchaService {
  constructor() {
    // 免费OCR API
    this.ocrApiUrl = 'https://api.ocr.space/parse/image';
    // 免费验证码识别API
    this.captchaApiUrl = 'https://www.vhippo.com/api/captcha/recognize';
  }

  async recognizeFromImage(imageBuffer) {
    try {
      // 方法1: 使用免费OCR.space API
      const formData = new FormData();
      formData.append('base64Image', `data:image/png;base64,${imageBuffer.toString('base64')}`);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      
      const response = await axios.post(this.ocrApiUrl, formData, {
        headers: {
          'apikey': 'helloworld' // 免费API Key，有限制
        },
        timeout: 10000
      });
      
      if (response.data.ParsedResults && response.data.ParsedResults.length > 0) {
        const text = response.data.ParsedResults[0].ParsedText.trim();
        // 过滤掉非数字和字母
        return text.replace(/[^a-zA-Z0-9]/g, '');
      }
      
      return null;
    } catch (error) {
      console.error('❌ OCR识别失败:', error.message);
      return null;
    }
  }

  async recognizeFromUrl(page, selector) {
    try {
      console.log('🔢 正在截取验证码图片...');
      
      // 截取验证码图片
      const captchaImage = await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (!element) return null;
        
        // 如果是canvas
        if (element.tagName === 'CANVAS') {
          return element.toDataURL('image/png').split(',')[1];
        }
        
        // 如果是img
        if (element.tagName === 'IMG') {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = element;
          canvas.width = img.width || 100;
          canvas.height = img.height || 40;
          ctx.drawImage(img, 0, 0);
          return canvas.toDataURL('image/png').split(',')[1];
        }
        
        // 如果是其他元素，尝试截取区域
        const rect = element.getBoundingClientRect();
        return {
          left: Math.floor(rect.left),
          top: Math.floor(rect.top),
          width: Math.floor(rect.width),
          height: Math.floor(rect.height)
        };
      }, selector);
      
      if (!captchaImage) {
        console.log('⚠️ 无法获取验证码图片');
        return null;
      }
      
      if (typeof captchaImage === 'object') {
        // 使用区域截图
        const screenshot = await page.screenshot({
          encoding: 'base64',
          clip: captchaImage
        });
        return await this.recognizeFromImage(Buffer.from(screenshot, 'base64'));
      }
      
      // 直接使用base64图片
      return await this.recognizeFromImage(Buffer.from(captchaImage, 'base64'));
    } catch (error) {
      console.error('❌ 验证码识别失败:', error.message);
      return null;
    }
  }

  // 简单验证码识别（纯数字）
  async recognizeSimple(page, selector) {
    try {
      console.log('🔢 正在识别简单验证码...');
      
      // 获取验证码图片元素
      const captchaData = await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (!element) return null;
        
        // 获取图片的src
        if (element.tagName === 'IMG') {
          return element.src;
        }
        
        // 获取背景图片
        const style = window.getComputedStyle(element);
        const bgImage = style.backgroundImage;
        if (bgImage && bgImage !== 'none') {
          const url = bgImage.match(/url\("?([^"]+)"?\)/);
          return url ? url[1] : null;
        }
        
        return null;
      }, selector);
      
      if (!captchaData) {
        return null;
      }
      
      // 如果是data URL，直接识别
      if (captchaData.startsWith('data:')) {
        const base64 = captchaData.split(',')[1];
        return await this.recognizeFromImage(Buffer.from(base64, 'base64'));
      }
      
      // 下载图片并识别
      const response = await axios.get(captchaData, { responseType: 'arraybuffer' });
      return await this.recognizeFromImage(Buffer.from(response.data));
    } catch (error) {
      console.error('❌ 简单验证码识别失败:', error.message);
      return null;
    }
  }
}

module.exports = new CaptchaService();