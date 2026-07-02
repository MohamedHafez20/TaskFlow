import { FaInstagram, FaWhatsapp, FaLinkedin } from 'react-icons/fa';

function Footer() {
  return (
    <footer className='border-t border-white/10 bg-[#090d18]/70 text-slate-400 backdrop-blur-2xl'>
      <div className='mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between'>
        <div className='space-y-3'>
          <p className='text-sm uppercase tracking-[0.3em] text-slate-500'>Midnight Focus</p>
          <p className='max-w-xl text-sm leading-6'>A premium productivity experience built for deep work, task mastery, and high-performance focus. Crafted with a modern SaaS dashboard aesthetic.</p>
        </div>

        <div className='flex gap-3'>
          <a href='https://wa.me/201208481291' target='_blank' rel='noreferrer' className='inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-slate-200 transition hover:bg-white/10'>
            <FaWhatsapp className='text-emerald-400' />
          </a>
          <a href='https://www.instagram.com/kamalalmasry' target='_blank' rel='noreferrer' className='inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-slate-200 transition hover:bg-white/10'>
            <FaInstagram className='text-fuchsia-400' />
          </a>
          <a href='https://www.linkedin.com/in/kamal-almorsy-31857a28a' target='_blank' rel='noreferrer' className='inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-slate-200 transition hover:bg-white/10'>
            <FaLinkedin className='text-sky-400' />
          </a>
        </div>
      </div>
      <div className='border-t border-white/10 py-4 text-center text-xs text-slate-500'>
        © {new Date().getFullYear()} Midnight Focus
      </div>
    </footer>
  );
}

export default Footer;
