// client/src/components/layout/SectionCard.jsx
import { Card, CardBody, Typography } from "@material-tailwind/react";

export default function SectionCard({ title, children }) {
  return (
    <Card>
      <CardBody>
        <Typography variant="h5" className="mb-4 text-left">
          {title}
        </Typography>
        <div className="text-left text-gray-700">{children}</div>
      </CardBody>
    </Card>
  );
}