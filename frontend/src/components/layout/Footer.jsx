import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin, FaLinkedinIn, FaFacebook } from 'react-icons/fa';
import taskFlowLogo from '../../assets/Logo.webp';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-transparent mt-20">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-xl border border-hair">
                <img src={taskFlowLogo} alt="TaskFlow" className="h-full w-full object-cover" />
              </div>
              <span className="text-lg font-bold tracking-tight text-ink">TaskFlow</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              Productivity tools that help you focus, ship work, and level up your skills — Pomodoro, tasks and gamification in one place.
            </p>

            <div className="flex items-center gap-3 mt-2">
              <a href="https://github.com/MohamedHafez20/TaskFlow" aria-label="TaskFlow on GitHub" target="_blank" rel="noreferrer" className="text-muted hover:text-ink transition">
                <FaGithub size={18} />
              </a>
              <a href="https://twitter.com/" aria-label="Twitter" target="_blank" rel="noreferrer" className="text-muted hover:text-ink transition">
                <FaTwitter size={18} />
              </a>
              <a href="https://www.linkedin.com/" aria-label="LinkedIn" target="_blank" rel="noreferrer" className="text-muted hover:text-ink transition">
                <FaLinkedin size={18} />
              </a>
              <a href="https://www.linkedin.com/" aria-label="LinkedIn" target="_blank" rel="noreferrer" className="text-muted hover:text-ink transition">
                <FaLinkedinIn size={18} />
              </a>
              <a href="https://www.facebook.com/" aria-label="Facebook" target="_blank" rel="noreferrer" className="text-muted hover:text-ink transition">
                <FaFacebook size={18} />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-ink mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-muted">
              <li><Link to="/app/dashboard" className="hover:text-[var(--c-accent)] transition">Dashboard</Link></li>
              <li><Link to="/app/pomodoro" className="hover:text-[var(--c-accent)] transition">Pomodoro</Link></li>
              <li><Link to="/app/games" className="hover:text-[var(--c-accent)] transition">Games</Link></li>
              <li><Link to="/app/chatbot" className="hover:text-[var(--c-accent)] transition">Chatbot</Link></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-ink mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-muted">
              <li><Link to="/app/analytics" className="hover:text-[var(--c-accent)] transition">Analytics</Link></li>
              <li><Link to="/app/history" className="hover:text-[var(--c-accent)] transition">History</Link></li>
              <li><Link to="/app/calendar" className="hover:text-[var(--c-accent)] transition">Calendar</Link></li>
              <li><Link to="/app/productivity" className="hover:text-[var(--c-accent)] transition">Productivity</Link></li>
            </ul>
          </div>

          {/* Company / Account Links */}
          <div>
            <h3 className="text-sm font-semibold text-ink mb-4">Account & Company</h3>
            <ul className="space-y-3 text-sm text-muted">
              <li><Link to="/app/user-profile" className="hover:text-[var(--c-accent)] transition">Profile</Link></li>
              <li><Link to="/login" className="hover:text-[var(--c-accent)] transition">Login</Link></li>
              <li><Link to="/register" className="hover:text-[var(--c-accent)] transition">Register</Link></li>
              <li><Link to="/app/settings" className="hover:text-[var(--c-accent)] transition">Settings</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-hair pt-6 flex ml-[290px] flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted">© {year} TaskFlow —Developed by OctoDocker Team. All rights reserved.</p>
         
        </div>
      </div>
    </footer>
  );
}

export default Footer;