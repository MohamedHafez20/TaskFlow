import taskFlowLogo from '../../assets/Logo.webp';

function Footer() {
  return (
    <footer className="relative backdrop-blur-3xl mt-20">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/10">
                <img src={taskFlowLogo} alt="TaskFlow" className="h-full w-full object-cover" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">TaskFlow</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-slate-400">
              A premium productivity ecosystem designed for deep work, task mastery, and high-performance focus.
            </p>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-2 lg:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#" className="hover:text-[#06f4e1] transition">Dashboard</a></li>
                <li><a href="#" className="hover:text-[#06f4e1] transition">Analytics</a></li>
                <li><a href="#" className="hover:text-[#06f4e1] transition">Features</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#" className="hover:text-[#06f4e1] transition">About</a></li>
                <li><a href="#" className="hover:text-[#06f4e1] transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#06f4e1] transition">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#" className="hover:text-[#06f4e1] transition">Help Center</a></li>
                <li><a href="#" className="hover:text-[#06f4e1] transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-[#06f4e1] transition">System Status</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © 2026 TaskFlow Inc. All rights reserved.
          </p>
          
        </div>
      </div>
    </footer>
  );
}

export default Footer;