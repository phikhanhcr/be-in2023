export class ImageHelper {
    static getThumbUrl(image: string): string {
        if (!image) {
            return '';
        }
        return image.replace(
            /^https?:\/\/image-(\d+)\.bituclub\.com\/(.+)$/,
            'https://thumb-$1.bituclub.com/thumb/_width_x_height_/$2',
        );
    }
}
