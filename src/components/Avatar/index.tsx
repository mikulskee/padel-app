import Image from "next/image";

type AvatarSize = "small" | "medium" | "large";
export const AvatarSize = {
  small: "small" as AvatarSize,
  medium: "medium" as AvatarSize,
  large: "large" as AvatarSize,
} as const;

export default function Avatar(
  { size, filename }: { size?: AvatarSize; filename: string } = {
    size: "small",
    filename: "default.png",
  }
) {
  const sizes = {
    [AvatarSize.small]: 20,
    [AvatarSize.medium]: 50,
    [AvatarSize.large]: 100,
  } as const;
  return (
    <div
      style={{
        height: sizes[size || AvatarSize.small],
        width: sizes[size || AvatarSize.small],
        borderRadius: "5px",
        overflow: "hidden",
        position: "relative",
        border: "1px solid #ccc",
      }}
    >
      <Image
        src={`/players/${filename}`}
        alt="Avatar"
        width={0}
        height={0}
        sizes="100vw"
        style={{
          width: "100%",
          height: "auto",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}
