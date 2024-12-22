import { SiReact, SiTypescript, SiVite, SiSpringboot, SiTailwindcss, SiElasticsearch, SiRedis, SiNginx, SiPostgresql, SiApachekafka, SiMinio, SiDocker, SiJenkins, SiGit, SiStripe, SiMailgun, SiAuth0 } from "@icons-pack/react-simple-icons"

export function About() {
  const frontendTech = [
    {
      icon: <SiReact className="h-8 w-8" />,
      name: "React",
      description: "Component-based UI library powering our interactive user interface with efficient state management and reusable components."
    },
    {
      icon: <SiTypescript className="h-8 w-8" />,
      name: "TypeScript",
      description: "Adds static typing to JavaScript, enhancing code quality and developer experience with better tooling and error detection."
    },
    {
      icon: <SiVite className="h-8 w-8" />,
      name: "Vite",
      description: "Modern build tool offering lightning-fast HMR (Hot Module Replacement) and optimized production builds."
    },
    {
      icon: <SiTailwindcss className="h-8 w-8" />,
      name: "Tailwind CSS",
      description: "Utility-first CSS framework used alongside shadcn/ui for rapid UI development with consistent design patterns."
    }
  ]

  const backendTech = [
    {
      icon: <SiSpringboot className="h-8 w-8" />,
      name: "Spring Boot",
      description: "Powers our backend with robust REST APIs, security implementations, and efficient database operations using JPA."
    },
    {
        icon: <SiElasticsearch className="h-8 w-8" />,
        name: "Elasticsearch",
        description: "Provides efficient search capabilities for our event listings."
    },
    {
        icon: <SiRedis className="h-8 w-8" />,
        name: "Redis",
        description: "Enhances performance by caching frequently accessed data, improving response times. It also serves as a service to reserve tickets for a customer until payment is made."
    },
    {
        icon: <SiSpringboot className="h-8 w-8" />,
        name: "Spring Eureka",
        description: "Ensures high availability and fault tolerance by providing a service registry and load balancing for our microservices."
    },
    {
        icon: <SiSpringboot className="h-8 w-8" />,
        name: "Spring Cloud Gateway",
        description: "Handles routing and load balancing for our microservices, ensuring smooth communication between them."
    },
    {
        icon: <SiNginx className="h-8 w-8" />,
        name: "Nginx",
        description: "Handles incoming requests and distributes them to the appropriate microservices, ensuring efficient load balancing and high availability."
    },
    {
        icon: <SiPostgresql className="h-8 w-8" />,
        name: "PostgreSQL",
        description: "Provides a robust and scalable database solution for storing and managing event data, customer information, ticket details, venue details and bookings."
    },
    {
        icon: <SiApachekafka className="h-8 w-8" />,
        name: "Apache Kafka",
        description: "Facilitates real-time communication between microservices, ensuring efficient event updates and ticket booking notifications."
    },
    {
        icon: <SiMinio className="h-8 w-8" />,
        name: "MinIO",
        description: "Provides an open-source scalable and reliable object storage solution for storing and retrieving event images and other media files."
    }
  ]

  const devOpsTech =[
    {
        icon: <SiDocker className="h-8 w-8" />,
        name: "Docker",
        description: "Enables containerization of our microservices, ensuring consistency across development, testing, and production environments."
    },
    {
        icon: <SiJenkins className="h-8 w-8" />,
        name: "Jenkins",
        description: "Automates the build, test, and deployment processes, ensuring consistent and reliable software delivery."
    },
    {
        icon: <SiGit className="h-8 w-8" />,
        name: "Git",
        description: "Facilitates version control, allowing for collaborative development and tracking of changes."
    }
  ]

  const thirdPartIntegrations = [
    {
        icon: <SiStripe className="h-8 w-8" />,
        name: "Stripe",
        description: "Provides secure payment processing for ticket purchases, ensuring a smooth and secure payment experience for our customers."
    },
    {
        icon: <SiMailgun className="h-8 w-8" />,
        name: "MailJet",
        description: "Facilitates real-time communication between our system and customers, ensuring efficient event updates and ticket booking notifications."
    },
    {
        icon: <SiAuth0 className="h-8 w-8" />,
        name: "Auth0",
        description: "Provides secure authentication and authorization for our users, ensuring the safety and privacy of their personal information."
    }
  ]

  return (
    <div className="container py-12 space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">About EventTix</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          EventTix is built with modern technologies to provide a seamless event booking experience. 
          Here's an overview of our technology stack.
        </p>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-semibold">Frontend Technologies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {frontendTech.map((tech) => (
            <div key={tech.name} className="p-6 border rounded-lg space-y-4">
              <div className="flex items-center gap-3">
                {tech.icon}
                <h3 className="text-xl font-semibold">{tech.name}</h3>
              </div>
              <p className="text-muted-foreground">{tech.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-semibold">Backend Technologies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {backendTech.map((tech) => (
            <div key={tech.name} className="p-6 border rounded-lg space-y-4">
              <div className="flex items-center gap-3">
                {tech.icon}
                <h3 className="text-xl font-semibold">{tech.name}</h3>
              </div>
              <p className="text-muted-foreground">{tech.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-semibold">DevOps Technologies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {devOpsTech.map((tech) => (
            <div key={tech.name} className="p-6 border rounded-lg space-y-4">
              <div className="flex items-center gap-3">
                {tech.icon}
                <h3 className="text-xl font-semibold">{tech.name}</h3>
              </div>
              <p className="text-muted-foreground">{tech.description}</p>
            </div>
          ))}
        </div>
    </section>

    <section className="space-y-8">
        <h2 className="text-2xl font-semibold">Third-Party Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {thirdPartIntegrations.map((tech) => (
            <div key={tech.name} className="p-6 border rounded-lg space-y-4">
              <div className="flex items-center gap-3">
                {tech.icon}
                <h3 className="text-xl font-semibold">{tech.name}</h3>
              </div>
              <p className="text-muted-foreground">{tech.description}</p>
            </div>
          ))}
        </div>
    </section>
    </div>
  )
}
