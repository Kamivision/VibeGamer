// client/src/components/layout/PageShell.jsx
import { Typography } from "@material-tailwind/react";

export default function PageShell({ title, subtitle, children }) {
  return (
    <section className="container mx-auto px-8 py-10">
      {title ? (
        <header className="mb-6 text-center">
          <Typography variant="h2" className="text-4xl font-bold">
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="paragraph" className="mt-2 text-gray-700">
              {subtitle}
            </Typography>
          ) : null}
        </header>
      ) : null}

      <div className="space-y-6">{children}</div>
    </section>
  );
}