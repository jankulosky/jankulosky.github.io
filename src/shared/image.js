import { urlFor } from "../client";

export const imageUrl = (source, { width, height, fit, format, quality } = {}) => {
  if (!source || !source.asset) return "";
  let builder = urlFor(source);
  if (width) builder = builder.width(width);
  if (height) builder = builder.height(height);
  if (fit) builder = builder.fit(fit);
  builder = format ? builder.format(format) : builder.auto("format");
  if (quality) builder = builder.quality(quality);
  return builder.url();
};
