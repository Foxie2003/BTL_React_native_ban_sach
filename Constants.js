const ip = "192.168.43.129";
export const APIsURL = `http://${ip}:3000`;
export const ImagesURL = `http://${ip}/img`;
export function formatPrice(number) {
    return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}