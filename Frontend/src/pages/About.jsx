import { motion } from "framer-motion";
import instagramIcon from "../assets/instagram-icon.png";
import facebookIcon from "../assets/facebook-icon.png";
import githubIcon from "../assets/github-icon.png";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <main className="font-serif text-gray-900 bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-linear-to-br from-indigo-50 via-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="uppercase tracking-widest text-sm font-semibold text-blue-600"
          >
            About Coding Gallery
            <br />
            "The Code Creators 😎"
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-7xl font-extrabold mt-4 leading-tight"
          >
            Share Knowledge. <br className="hidden sm:block" />
            Inspire Developers.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-gray-600 max-w-4xl mx-auto"
          >
            Coding Gallery is a modern platform for developers to write, learn,
            and grow together.
          </motion.p>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 grid sm:grid-cols-3 gap-10 text-center">
          {[
            { value: "X+", label: "Active Creators" },
            { value: "Y+", label: "Blogs Published" },
            { value: "1+", label: "Years of Learning" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-8 shadow-sm border"
            >
              <div className="text-4xl font-bold text-blue-600">{s.value}</div>
              <p className="mt-2 font-medium text-gray-600">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* STORY */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-4xl font-bold mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Coding Gallery was born from the idea that learning to code
              becomes easier when knowledge is shared openly.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Built in Gorakhpur, India, this platform focuses on simplicity,
              speed, and developer-first experience.
            </p>
          </motion.div>

          <motion.img
            src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg"
            alt="Workspace"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="rounded-3xl shadow-xl w-full h-96 object-cover"
          />
        </div>
      </section>

      {/* FOUNDER */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-10">Founder</h2>

          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl p-10 shadow-lg border"
          >
            <img
              src="https://res.cloudinary.com/dbzu78ver/image/upload/v1769931980/WhatsApp_Image_2026-02-01_at_1.15.31_PM_dswhjm.jpg"
              className="w-36 h-36 mx-auto rounded-2xl object-cover shadow-lg mb-6"
              alt="Founder"
            />
            <h3 className="text-2xl font-bold">Vishal Maurya</h3>
            <p className="text-blue-600 font-semibold mb-4">
              Founder & Full-Stack Developer
            </p>
            <p className="text-gray-600 max-w-xl mx-auto leading-relaxed">
              Passionate about building developer tools, learning in public, and
              creating platforms that empower others to grow.
            </p>
          </motion.div>

          {/* Social */}
          <div className="flex justify-center gap-6 mt-10">
            <a href="https://www.instagram.com/">
              <img className="h-9" src={instagramIcon} />
            </a>
            <a href="https://www.facebook.com/">
              <img className="h-9" src={facebookIcon} />
            </a>
            <a href="https://www.github.com/">
              <img className="h-9" src={githubIcon} />
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-900 text-white py-24 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Start Writing on Coding Gallery
        </h2>
        <p className="text-blue-100 max-w-xl mx-auto mb-10 text-lg">
          Share what you learn. Help others grow. Build your developer voice.
        </p>
         <Link to={"/Add-blogs"}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="bg-white text-blue-900 px-10 py-4 rounded-2xl font-bold text-lg shadow-xl cursor-pointer"
        >
          Get Started Free
        </motion.button>
        </Link>
      </section>
    </main>
  );
}
