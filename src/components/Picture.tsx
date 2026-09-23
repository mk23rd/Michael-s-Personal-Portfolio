import type { ImgHTMLAttributes } from "react";
import { imageSet, type ImageName } from "@/lib/images";

type PictureProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "width" | "height"> & {
  name: ImageName;
  /** How wide the image renders, in the srcset `sizes` grammar, so the browser can pick the smallest fitting file. */
  sizes: string;
};

/**
 * AVIF first, WebP second, the original JPEG for anything older. The <picture> element itself is
 * display: contents (see index.css), so existing selectors and sizing on the <img> keep working.
 */
const Picture = ({ name, sizes, alt = "", ...rest }: PictureProps) => {
  const set = imageSet(name);
  return (
    <picture>
      <source type="image/avif" srcSet={set.avif} sizes={sizes} />
      <source type="image/webp" srcSet={set.webp} sizes={sizes} />
      <img src={set.src} width={set.width} height={set.height} alt={alt} {...rest} />
    </picture>
  );
};

export default Picture;
