"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPrice = formatPrice;
exports.slugify = slugify;
exports.truncate = truncate;
exports.formatDuration = formatDuration;
exports.getInitials = getInitials;
function formatPrice(price) {
    return `¥${price.toFixed(2)}`;
}
function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');
}
function truncate(text, maxLength) {
    if (text.length <= maxLength)
        return text;
    return text.slice(0, maxLength) + '...';
}
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0)
        return `${hours}小时${minutes}分钟`;
    return `${minutes}分钟`;
}
function getInitials(name) {
    return name.slice(0, 1).toUpperCase();
}
//# sourceMappingURL=index.js.map