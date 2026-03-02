import { motion } from "framer-motion";
import { Link2, ShieldCheck, Star, Zap } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const items = [
  {
    icon: Link2,
    title: "Linking Jobs & Skill",
    description:
      "Every job request is matched with qualified, local professionals ready to respond with clear proposals.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Credentials",
    description:
      "Licences, IDs, ABNs and insurance are verified so clients can hire with confidence and peace of mind.",
  },
  {
    icon: Star,
    title: "Transparent Reviews",
    description:
      "Ratings and written feedback keep quality visible, helping the best contractors stand out over time.",
  },
  {
    icon: Zap,
    title: "On‑Demand Access",
    description:
      "SubbyMe makes skilled help accessible when you need it most – fast, reliable and always in your control.",
  },
];

export function MissionSection() {
  return (
    <section
      className="relative overflow-hidden py-20 sm:py-24"
      aria-labelledby="mission-heading"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-blue-500/5" />
      <div className="absolute left-1/2 top-0 h-px w-full max-w-2xl -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container-main">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <h2
            id="mission-heading"
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Our{" "}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Mission
            </span>
          </h2>
          <p className="mx-auto mt-3 text-base sm:text-lg text-muted-foreground">
            SubbyMe exists to simplify the hiring process by connecting trusted tradespeople
            with the clients who need them most.
          </p>
        </motion.div>

        <motion.div
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {items.map((item) => (
            <motion.article
              key={item.title}
              className="group relative"
              variants={cardVariants}
            >
              <motion.div
                className="relative h-full rounded-2xl border border-border/60 bg-card/90 p-6 shadow-sm backdrop-blur-sm transition-colors"
                whileHover={{
                  y: -6,
                  scale: 1.02,
                  boxShadow:
                    "0 22px 40px -18px rgba(15, 23, 42, 0.18)",
                  transition: { duration: 0.3 },
                }}
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-1">
                  <item.icon
                    className="h-6 w-6"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

