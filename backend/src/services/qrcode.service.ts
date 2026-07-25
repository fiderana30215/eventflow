import QRCode from "qrcode";

export async function generateQrCodeDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload);
}