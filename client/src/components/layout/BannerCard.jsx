// client/src/components/layout/BannerCard.jsx
import { Card, CardBody, CardHeader, Typography } from "@material-tailwind/react";

export default function BannerCard({
  title,
  imageSrc,
  imageAlt,
  children,
  className = "border border-gray-300 rounded-2xl bg-violet-500",
}) {
  return (
    <Card shadow={false} className={className}>
      <Typography className="pt-4 text-center text-4xl font-bold text-yellow-300 text-shadow-lg">
        {title}
      </Typography>

      <CardHeader shadow={false} className="mt-5 h-70 rounded-lg">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-full w-full object-cover object-center"
        />
      </CardHeader>

      <CardBody className="bg-white">{children}</CardBody>
    </Card>
  );
}