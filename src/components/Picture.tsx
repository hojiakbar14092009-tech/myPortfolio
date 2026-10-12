import type { CSSProperties } from 'react';
import { imageSet, type ImageName } from '../data/images';

type Props = {
  name: ImageName;
  alt: string;
  sizes: string;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  priority?: boolean;
};

// AVIF -> WebP -> JPG with intrinsic size so layout never shifts.
export function Picture({ name, alt, sizes, className, imgClassName, style, priority }: Props) {
  const s = imageSet(name);
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={s.avif} sizes={sizes} />
      <source type="image/webp" srcSet={s.webp} sizes={sizes} />
      <img
        src={s.src}
        srcSet={s.jpg}
        sizes={sizes}
        alt={alt}
        width={1000}
        height={Math.round(1000 / s.ratio)}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...{ fetchpriority: priority ? 'high' : 'auto' }}
        className={imgClassName}
        style={style}
        draggable={false}
      />
    </picture>
  );
}
