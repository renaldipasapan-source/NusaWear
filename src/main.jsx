import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';
import './style.css';
import { supabase, supabaseConfigured } from './supabase.js';

const WA = '+62 859-2453-8371'; // Nomor WhatsApp dummy, silakan diganti.
const EMAIL = 'renaldipasapan@gmail.com';
const COMMUNITY_DEFAULT_IMAGE = '/images/community-style.jpg';
const COMMUNITY_TOPICS = [
  { id: 'semua', name: 'Semua cerita', description: 'Semua inspirasi dari komunitas Nusa.', mark: '✳' },
  { id: 'outfit-harian', name: 'Outfit harian', description: 'Ide gaya yang nyaman dipakai sehari-hari.', mark: '01' },
  { id: 'mix-match', name: 'Mix & match', description: 'Padu padan warna, tekstur, dan favoritmu.', mark: '02' },
  { id: 'local-brand', name: 'Brand lokal', description: 'Kenalkan karya dan label lokal pilihanmu.', mark: '03' },
  { id: 'sustainable-style', name: 'Gaya berkelanjutan', description: 'Thrift, rawat pakaian, dan pakai ulang.', mark: '04' },
  { id: 'event-nusa', name: 'Event Nusa', description: 'Cerita pertemuan, workshop, dan pop-up.', mark: '05' },
];
const PRODUCTS = [
  { id: 'kaos-oversize', name: 'Kaos Oversize Essential', category: 'Kaos', price: 129000, oldPrice: 159000, stock: 24, sold: 128, tag: 'Terlaris', color: 'peach', emoji: '👕', image: '/images/kaos-oversize.jpg', description: 'Kaos katun combed 24s yang lembut, nyaman, dan jatuh dengan pas. Potongan relaxed fit untuk gaya santai setiap hari.' },
  { id: 'kemeja-linen', name: 'Kemeja Linen Aruna', category: 'Kemeja', price: 239000, oldPrice: 279000, stock: 12, sold: 96, tag: 'Pilihan kami', color: 'sand', emoji: '👔', image: '/images/kemeja-linen.jpg', description: 'Kemeja bertekstur linen blend yang ringan dan breathable. Siluet clean, mudah dipadukan untuk tampilan kasual maupun semi formal.' },
  { id: 'outer-denim', name: 'Outer Denim Kota', category: 'Outerwear', price: 329000, oldPrice: null, stock: 8, sold: 74, tag: 'Stok terbatas', color: 'mint', emoji: '🧥', image: '/images/outer-denim.jpg', description: 'Jaket denim ringan dengan detail saku fungsional dan jahitan rapi. Layering favorit untuk menemani aktivitas dari pagi sampai malam.' },
  { id: 'hoodie-essential', name: 'Hoodie Essential', category: 'Outerwear', price: 299000, oldPrice: 349000, stock: 15, sold: 63, tag: 'Diskon', color: 'lavender', emoji: '🧥', image: '/images/hoodie-essential.jpg', description: 'Hoodie fleece premium yang hangat tapi tetap ringan. Dilengkapi kantong depan dan potongan unisex yang mudah dipadukan.' },
  { id: 'celana-chino', name: 'Celana Chino Harian', category: 'Celana', price: 269000, oldPrice: null, stock: 19, sold: 51, tag: '', color: 'yellow', emoji: '👖', image: '/images/celana-chino.jpg', description: 'Celana chino dengan bahan stretch yang nyaman untuk bergerak. Potongan tapered memberi tampilan rapi tanpa terasa kaku.' },
  { id: 'blouse-senja', name: 'Blouse Senja', category: 'Atasan', price: 219000, oldPrice: null, stock: 10, sold: 42, tag: 'Baru', color: 'coral', emoji: '👚', image: '/images/blouse-senja.jpg', description: 'Blouse ringan dengan detail kerah lembut dan potongan yang nyaman. Pilihan manis untuk bekerja maupun berkumpul bersama teman.' },
  { id: 'kaos-katun-pagi', name: 'Kaos Katun Pagi', category: 'Kaos', price: 139000, oldPrice: null, stock: 20, sold: 37, tag: 'Baru', color: 'sand', emoji: '👕', image: '/images/kaos-basic.jpg', description: 'Kaos katun lembut dengan potongan santai dan warna netral. Mudah dipadukan untuk rutinitas harian.' },
  { id: 'kemeja-garis-senja', name: 'Kemeja Garis Senja', category: 'Kemeja', price: 249000, oldPrice: null, stock: 16, sold: 34, tag: 'Baru', color: 'peach', emoji: '👔', image: '/images/kemeja-garis.jpg', description: 'Kemeja bergaris dengan bahan ringan dan potongan relaxed. Pas untuk tampilan rapi yang tetap terasa santai.' },
  { id: 'kemeja-sora', name: 'Kemeja Sora Relaxed', category: 'Kemeja', price: 229000, oldPrice: null, stock: 14, sold: 28, tag: '', color: 'mint', emoji: '👔', image: '/images/kemeja-sora.jpg', description: 'Kemeja kasual berpotongan longgar dengan warna mudah dipadukan, nyaman dipakai sendiri maupun sebagai outer.' },
  { id: 'cardigan-rona', name: 'Cardigan Rona', category: 'Outerwear', price: 279000, oldPrice: null, stock: 11, sold: 31, tag: 'Baru', color: 'coral', emoji: '🧥', image: '/images/outer-cardigan.jpg', description: 'Cardigan ringan dengan tekstur lembut untuk menemani hari yang sejuk. Nyaman dipadukan dengan kaos atau blouse.' },
  { id: 'jaket-ringan-rimba', name: 'Jaket Ringan Rimba', category: 'Outerwear', price: 349000, oldPrice: null, stock: 9, sold: 26, tag: '', color: 'sand', emoji: '🧥', image: '/images/outer-ringan.jpg', description: 'Jaket ringan untuk layering praktis saat bepergian. Siluetnya sederhana dan mudah masuk ke berbagai gaya.' },
  { id: 'jaket-urban-loka', name: 'Jaket Urban Loka', category: 'Outerwear', price: 379000, oldPrice: 419000, stock: 7, sold: 22, tag: 'Pilihan kami', color: 'lavender', emoji: '🧥', image: '/images/outer-urban.jpg', description: 'Jaket bergaya urban dengan tampilan tegas dan potongan nyaman. Pilihan versatile untuk melengkapi outfit harian.' },
  { id: 'outer-layer-nara', name: 'Outer Layer Nara', category: 'Outerwear', price: 289000, oldPrice: null, stock: 13, sold: 19, tag: '', color: 'peach', emoji: '🧥', image: '/images/outer-layer.jpg', description: 'Outer ringan untuk sentuhan akhir yang effortless. Potongannya nyaman untuk dikenakan sepanjang hari.' },
  { id: 'celana-wide-everyday', name: 'Celana Wide Everyday', category: 'Celana', price: 289000, oldPrice: null, stock: 12, sold: 24, tag: 'Baru', color: 'mint', emoji: '👖', image: '/images/celana-wide.jpg', description: 'Celana berpotongan relaxed yang leluasa untuk bergerak dan nyaman dipadukan dengan atasan favorit.' },
  { id: 'blouse-laras', name: 'Blouse Laras', category: 'Atasan', price: 229000, oldPrice: null, stock: 10, sold: 18, tag: '', color: 'yellow', emoji: '👚', image: '/images/atasan-laras.jpg', description: 'Blouse berpotongan ringan dengan nuansa lembut, cocok untuk suasana kerja maupun akhir pekan.' },
];
const EVENTS = [
  { id: 'style-swap', date: '28 Nov 2026', time: '10.00–14.00 WIB', type: 'Community meetup', title: 'Style Swap: Beri Gaya Baru pada Pakaian Lama', location: 'M Bloc Space, Jakarta', image: '/images/community-style.jpg', description: 'Bawa satu pakaian yang masih layak, pulang dengan inspirasi baru. Ada sesi mix & match dan mini market brand lokal.', agenda: ['10.00 — Registrasi dan kenalan komunitas', '10.30 — Sesi tukar pakaian', '12.00 — Mix & match bersama stylist', '13.00 — Jelajah mini market brand lokal'], notes: ['Bawa maksimal 2 pakaian bersih dan layak pakai.', 'Tiket gratis dan berlaku untuk satu orang.', 'Tunjukkan QR tiket kepada panitia saat datang.'] },
  { id: 'weekend-market', date: '05 Des 2026', time: '09.00–17.00 WIB', type: 'Pop-up market', title: 'Nusa Weekend Market', location: 'Urban Forest Cipete, Jakarta', image: '/images/hero-style.jpg', description: 'Kenalan langsung dengan koleksi Nusa Wear, cek bahan, coba ukuran, dan nikmati penawaran khusus di booth kami.', agenda: ['09.00 — Area market dibuka', '11.00 — Styling session dan konsultasi ukuran', '14.00 — Meet the maker bersama brand lokal', '17.00 — Acara selesai'], notes: ['Tiket gratis dan berlaku untuk satu orang.', 'Tunjukkan QR tiket di meja registrasi.', 'Pembelian produk di lokasi dilakukan langsung di booth.'] },
  { id: 'closet-talk', date: '12 Des 2026', time: '15.00–16.30 WIB', type: 'Workshop', title: 'Closet Talk: Gaya Lebih Sadar', location: 'Online · Google Meet', image: '/images/kaos-oversize.jpg', description: 'Obrolan santai bersama stylist tentang membangun lemari kapsul yang lebih personal dan mudah dipakai ulang.', agenda: ['15.00 — Ruang meeting dibuka', '15.10 — Sesi membangun lemari kapsul', '15.50 — Tanya jawab bersama stylist', '16.20 — Penutup dan foto bersama'], notes: ['Tautan Google Meet dibagikan ke peserta terdaftar sebelum acara.', 'Siapkan 3 pakaian favorit untuk sesi diskusi.', 'Tiket berlaku untuk satu peserta.'] },
];
const HOME_FEATURES = [
  { eyebrow: 'NUSA WEAR · KOLEKSI HARIAN', title: <>Gaya yang terasa<br /><em>seperti dirimu.</em></>, description: 'Pakaian nyaman untuk hari-hari nyata. Temukan potongan andalan yang mudah dipadukan ke mana pun kamu pergi.', image: '/images/hero-style.jpg', alt: 'Inspirasi gaya harian Nusa Wear', link: '/produk', action: 'Jelajahi koleksi' },
  { eyebrow: 'KENALAN DENGAN TEMAN BARU', title: <>Bukan cuma outfit.<br /><em>Ini cerita kita.</em></>, description: 'Berbagi inspirasi gaya, temukan teman baru, dan jadi bagian dari komunitas Nusa Wear.', image: COMMUNITY_DEFAULT_IMAGE, alt: 'Teman-teman berbagi inspirasi gaya', link: '/komunitas', action: 'Masuk komunitas' },
  { eyebrow: 'NUSA WEAR HAPPENINGS', title: <>Ketemu langsung,<br /><em>seru-seruan bareng.</em></>, description: 'Ikuti pop-up, workshop, dan acara pilihan untuk merayakan gaya yang lebih personal.', image: '/images/outer-denim.jpg', alt: 'Pilihan pakaian untuk acara komunitas', link: '/event', action: 'Lihat event' },
];
const COMMUNITY_POSTS = [
  { id: 'look-01', author: 'Nadia P.', location: 'Bandung', caption: 'Layering simpel untuk hari yang jadwalnya padat. Kuncinya: pilih bahan yang tetap nyaman bergerak. ✨', image: COMMUNITY_DEFAULT_IMAGE, likes: 24, topic: 'outfit-harian' },
  { id: 'look-02', author: 'Raka A.', location: 'Jakarta', caption: 'Satu kemeja linen, bisa dibawa dari meeting sampai nongkrong sore. #GayaSehariHari', image: '/images/kemeja-linen.jpg', likes: 18, topic: 'mix-match' },
  { id: 'look-03', author: 'Salsa R.', location: 'Yogyakarta', caption: 'Pakai yang bikin nyaman, lalu jadikan harimu milikmu sendiri. 🌿', image: '/images/hero-style.jpg', likes: 32, topic: 'sustainable-style' },
];
const emptyState = () => ({ version: 2, products: PRODUCTS, users: [], orders: [], wishlist: [], cart: [], interview: null, eventRegistrations: [], communityPosts: COMMUNITY_POSTS, communityLikes: [] });
const mapAuthUser = authUser => authUser ? ({
  id: authUser.id,
  name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Pelanggan',
  email: authUser.email || '',
}) : null;
const Context = createContext(null);
function StoreProvider({ children }) {
  const [state, setState] = useState(emptyState);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [stateReady, setStateReady] = useState(false);
  const [stateWritable, setStateWritable] = useState(false);
  const [storeError, setStoreError] = useState('');
  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      setStateReady(true);
      return undefined;
    }
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setStoreError(`Gagal memeriksa sesi Supabase: ${error.message}`);
      setUser(mapAuthUser(data.session?.user));
      setAuthReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapAuthUser(session?.user));
      setAuthReady(true);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!authReady) return;
    if (!user || !supabase) {
      setState(emptyState());
      setStateWritable(false);
      setStateReady(true);
      return;
    }
    let active = true;
    setStateReady(false);
    setStateWritable(false);
    supabase.from('customer_data').select('data').eq('user_id', user.id).maybeSingle().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setStoreError(`Gagal membaca data akun dari Supabase: ${error.message}`);
        setStateReady(true);
        return;
      }
      if (data?.data && typeof data.data === 'object') setState({ ...emptyState(), ...data.data, products: PRODUCTS });
      setStoreError('');
      setStateWritable(true);
      setStateReady(true);
    });
    return () => { active = false; };
  }, [authReady, user?.id]);
  useEffect(() => {
    if (!stateReady || !stateWritable || !user || !supabase) return undefined;
    const timer = setTimeout(async () => {
      const { error } = await supabase.from('customer_data').upsert({ user_id: user.id, data: state, updated_at: new Date().toISOString() });
      if (error) setStoreError(`Gagal menyimpan data ke Supabase: ${error.message}`);
      else setStoreError('');
    }, 350);
    return () => clearTimeout(timer);
  }, [state, stateReady, stateWritable, user?.id]);
  async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setStoreError(`Gagal keluar dari akun: ${error.message}`);
  }
  async function updateProfile(name) {
    if (!supabase || !user) return new Error('Supabase belum terhubung.');
    const { error: authError } = await supabase.auth.updateUser({ data: { full_name: name } });
    if (authError) return authError;
    const { error } = await supabase.from('profiles').update({ full_name: name }).eq('id', user.id);
    if (error) return error;
    setUser({ ...user, name });
    return null;
  }
  return <Context.Provider value={{ state, setState, user, setUser, authReady, stateReady, storeError, signOut, updateProfile, supabaseConfigured }}>{children}</Context.Provider>;
}
const useStore = () => useContext(Context);
const rupiah = amount => `Rp${Number(amount).toLocaleString('id-ID')}`;
function Icon({ type, size = 19 }) {
  const d = { search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>, bag: <><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></>, heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>, user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>, arrow: <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>, menu: <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></> };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d[type]}</svg>;
}
function App() {
  const { state, user, storeError } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menu, setMenu] = useState(false);
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
  return <><div className="announcement">Koleksi baru sudah hadir <span>✳</span> Gratis ongkir min. belanja Rp350.000 <span className="announcement-extra">·</span> <Link to="/event">Lihat event mendatang →</Link></div>{storeError && <p className="store-error" role="alert">{storeError}</p>}<header className="header"><div className="nav-wrap"><Link to="/" className="brand"><span className="brand-mark">nw</span><span>NUSA<span className="brand-light">WEAR</span><small>SiriousLei Store</small></span></Link><nav className={menu ? 'nav-links open' : 'nav-links'}><NavLink to="/" onClick={() => setMenu(false)}>Beranda</NavLink><NavLink to="/produk" onClick={() => setMenu(false)}>Koleksi</NavLink><NavLink to="/event" onClick={() => setMenu(false)}>Event</NavLink><NavLink to="/komunitas" onClick={() => setMenu(false)}>Komunitas</NavLink></nav><form className="searchbar" onSubmit={event => { event.preventDefault(); navigate(`/produk?q=${encodeURIComponent(search)}`); }}><Icon type="search" /><input placeholder="Cari pakaian favoritmu..." value={search} onChange={event => setSearch(event.target.value)} /><kbd>↵</kbd></form><div className="nav-actions"><Link className="icon-btn" title="Wishlist" to="/wishlist"><Icon type="heart" /></Link><Link className="icon-btn bag-btn" title="Keranjang" to="/keranjang"><Icon type="bag" />{count > 0 && <span className="badge-count">{count}</span>}</Link><Link className="profile-link" to={user ? '/akun' : '/masuk'} aria-label={user ? `Profil ${user.name}` : 'Masuk'}><Icon type="user" /><span>{user ? user.name : 'Masuk'}</span></Link><button className="mobile-menu" onClick={() => setMenu(!menu)} aria-label="Buka menu"><Icon type="menu" /></button></div></div></header><main><Routes><Route path="/" element={<Home />} /><Route path="/masuk" element={<Auth />} /><Route path="/daftar" element={<Auth register />} /><Route path="/tentang" element={<About />} /><Route path="/kontak" element={<Contact />} /><Route path="/event" element={<EventsPage />} /><Route path="/event/:id" element={<EventDetailPage />} /><Route path="/komunitas" element={<CommunityPage />} /><Route path="/produk" element={<Products />} /><Route path="/produk/:id" element={<Product />} /><Route path="/wishlist" element={<Protected><Wishlist /></Protected>} /><Route path="/keranjang" element={<Protected><Cart /></Protected>} /><Route path="/checkout" element={<Protected><Checkout /></Protected>} /><Route path="/pesanan" element={<Protected><Orders /></Protected>} /><Route path="/akun" element={<Protected><Account /></Protected>} /><Route path="*" element={<Home />} /></Routes></main><Footer /></>;
}
function Protected({ children }) { const { user, authReady, stateReady } = useStore(); const location = window.location; if (!authReady || (user && !stateReady)) return <div className="empty-state"><p>Memuat data akun...</p></div>; return user ? children : <Navigate to={`/masuk?next=${encodeURIComponent(location.pathname + location.search)}`} replace />; }
function ProductCard({ product }) {
  const { state, setState, user } = useStore();
  const navigate = useNavigate();
  const liked = state.wishlist.includes(product.id);
  const toggle = event => { event.preventDefault(); event.stopPropagation(); if (!user) return navigate(`/masuk?next=${encodeURIComponent(`/produk/${product.id}`)}`); setState({ ...state, wishlist: liked ? state.wishlist.filter(id => id !== product.id) : [...state.wishlist, product.id] }); };
  const add = () => { if (!user) return navigate(`/masuk?next=${encodeURIComponent(`/produk/${product.id}`)}`); const row = state.cart.find(item => item.id === product.id); setState({ ...state, cart: row ? state.cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item) : [...state.cart, { id: product.id, qty: 1 }] }); };
  return <article className="product-card"><Link to={`/produk/${product.id}`} className={`product-image ${product.color}`}><img src={product.image} alt={product.name} loading="lazy" onError={event => { event.currentTarget.style.display = 'none'; const fallback = event.currentTarget.nextElementSibling; if (fallback) fallback.style.display = 'grid'; }} /><span className="product-emoji fallback-emoji">{product.emoji}</span>{product.tag && <span className="product-tag">{product.tag}</span>}<button onClick={toggle} className={liked ? 'heart-btn liked' : 'heart-btn'} aria-label="Simpan ke wishlist"><Icon type="heart" /></button></Link><div className="product-info"><p className="product-cat">{product.category}</p><Link to={`/produk/${product.id}`} className="product-name">{product.name}</Link><div className="stars">★★★★★ <span>({product.sold})</span></div><div className="price-line"><strong>{rupiah(product.price)}</strong>{product.oldPrice && <del>{rupiah(product.oldPrice)}</del>}</div><button className="quick-add" onClick={add}>+ Tambah ke keranjang</button></div></article>;
}
function HomeOriginal() {
  const { state, user } = useStore();
  const shopLink = '/produk';
  return <><section className="hero"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line" /> MADE TO MOVE WITH YOU</div><h1>Gaya yang terasa<br /><em>seperti dirimu.</em></h1><p>Pilihan pakaian harian dengan bahan nyaman, potongan yang pas, dan detail sederhana untuk menemani ke mana pun kamu pergi.</p><div className="hero-actions"><Link className="btn-primary" to={shopLink}>Lihat koleksi <Icon type="arrow" size={17} /></Link><a className="text-link" href="#cerita">Kenali Nusa Wear <span>↘</span></a></div><div className="social-proof"><div className="avatars"><span>✦</span><span>✳</span><span>♡</span></div><div><b>Gaya untuk setiap hari</b><small>Dirancang dengan nyaman dalam pikiran</small></div></div></div><div className="hero-art"><div className="hero-backdrop" /><div className="hero-sticker">NUSA<br /><span>NEW SEASON</span><br />✳</div><span className="hero-spark spark-one">✳</span><span className="hero-spark spark-two">✳</span><div className="hero-photo"><img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1100&q=85" alt="Koleksi gaya harian Nusa Wear" /></div><div className="floating-note"><span>✦</span><div><b>Everyday essentials</b><small>Nyaman dipakai, mudah dipadu</small></div></div><div className="hero-caption"><span>01 / 03</span><span className="caption-line" /><span>NEW SEASON COLLECTION</span></div></div></section><section className="promise-strip"><div><span className="promise-icon">♧</span><span><b>Bahan pilihan</b><small>Nyaman untuk setiap hari</small></span></div><div><span className="promise-icon">✳</span><span><b>Potongan versatile</b><small>Mudah dipadukan</small></span></div><div><span className="promise-icon">♡</span><span><b>Detail diperhatikan</b><small>Dibuat untuk menemanimu</small></span></div><div><span className="promise-icon">⌁</span><span><b>Pengiriman nasional</b><small>Belanja dari mana saja</small></span></div></section><section className="section product-section" id="produk"><div className="section-head"><div><p className="eyebrow"><span className="eyebrow-line" /> PILIHAN MINGGU INI</p><h2>Yang paling <em>disukai.</em></h2></div><Link className="all-link" to={shopLink}>Lihat semua produk <Icon type="arrow" size={16} /></Link></div><div className="category-pills"><Link to={shopLink}>Semua</Link><Link to={shopLink}>Atasan</Link><Link to={shopLink}>Kemeja</Link><Link to={shopLink}>Outerwear</Link><span>✦ Koleksi nyaman sepanjang hari</span></div><div className="product-grid">{state.products.slice(0, 4).map(product => <ProductCard key={product.id} product={product} />)}</div></section><section className="promo-banner"><div className="promo-copy"><p className="eyebrow">THE EVERYDAY EDIT</p><h2>Satu koleksi,<br /><em>banyak cerita.</em></h2><p>Temukan paduan andalan untuk hari sibuk hingga akhir pekan santai.</p><Link className="btn-cream" to={shopLink}>Belanja koleksi <Icon type="arrow" size={16} /></Link></div><div className="promo-visual"><div className="promo-orbit" /><span className="promo-food">👕</span><span className="promo-food promo-food-2">🧥</span><span className="promo-food promo-food-3">👖</span><span className="promo-tape">EVERYDAY STYLE ✳ EVERYDAY STYLE ✳</span></div></section><section className="section story-section" id="cerita"><div className="story-visual"><div className="story-photo"><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85" alt="Inspirasi gaya harian Nusa Wear" /></div><div className="story-note">PAKAI GAYAMU<br />SETIAP HARI <span>♡</span></div><span className="story-doodle">✺</span></div><div className="story-copy"><p className="eyebrow"><span className="eyebrow-line" /> CERITA NUSA WEAR</p><h2>Dibuat untuk hari-hari <em>nyata.</em></h2><p>Nusa Wear adalah contoh brand pakaian lokal dengan pilihan gaya sehari-hari. Koleksi kami dirancang agar mudah dipadukan, nyaman dipakai, dan tetap terasa personal.</p><p>Setiap pilihan dibuat dengan memperhatikan material, potongan, dan detail kecil yang membuatmu percaya diri menjalani harimu.</p><Link className="text-link" to="/tentang">Kenali Nusa Wear lebih dekat <span>→</span></Link></div></section><Newsletter /></>;
}
function Products() {
  const { state } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('kategori') || 'Semua';
  const filtered = state.products.filter(product => (
    (!query || `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase()))
    && (category === 'Semua' || product.category === category)
  ));
  const selectCategory = selected => {
    setSearchParams(params => {
      params.delete('q');
      if (selected === 'Semua') params.delete('kategori');
      else params.set('kategori', selected);
      return params;
    });
  };
  return <div className="page-container"><p className="eyebrow"><span className="eyebrow-line" /> KOLEKSI NUSA WEAR</p><div className="page-title-row"><div><h1>Temukan <em>gayamu.</em></h1><p>Pilihan pakaian yang nyaman untuk menemani setiap harimu.</p></div><span className="results-count">{filtered.length} produk</span></div><div className="category-pills product-filter">{['Semua', 'Kaos', 'Kemeja', 'Atasan', 'Outerwear', 'Celana'].map(item => <button type="button" className={category === item ? 'active' : ''} aria-pressed={category === item} onClick={() => selectCategory(item)} key={item}>{item}</button>)}</div>{filtered.length ? <div className="product-grid">{filtered.map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><span>👕</span><h2>Produk tidak ditemukan.</h2><Link to="/produk" className="btn-primary">Lihat semua koleksi</Link></div>}</div>;
}
function Product() { const { id } = useParams(); const { state, setState } = useStore(); const product = state.products.find(item => item.id === id); const [qty, setQty] = useState(1); const [added, setAdded] = useState(false); if (!product) return <div className="empty-state"><h2>Produk tidak ditemukan.</h2><Link to="/produk" className="btn-primary">Kembali ke koleksi</Link></div>; const row = state.cart.find(item => item.id === product.id); return <div className="page-container"><div className="breadcrumb"><Link to="/">Beranda</Link> / <Link to="/produk">Koleksi</Link> / {product.name}</div><div className="detail-layout"><div className={`detail-image ${product.color}`}><img src={product.image} alt={product.name} onError={event => { event.currentTarget.style.display = 'none'; const fallback = event.currentTarget.nextElementSibling; if (fallback) fallback.style.display = 'grid'; }} /><span className="detail-emoji">{product.emoji}</span><small>✳ NUSA WEAR EVERYDAY COLLECTION ✳</small></div><div className="detail-copy"><p className="product-cat">{product.category}</p><h1>{product.name}</h1><div className="stars">★★★★★ <span>({product.sold} ulasan)</span></div><div className="detail-price">{rupiah(product.price)} {product.oldPrice && <del>{rupiah(product.oldPrice)}</del>}</div><p className="detail-desc">{product.description}</p><div className="stock-note">✦ Tersedia — sisa {product.stock} buah</div><div className="qty-row"><div className="quantity"><button onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span>{qty}</span><button onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button></div><button className="btn-primary add-detail" onClick={() => { setState({ ...state, cart: row ? state.cart.map(item => item.id === product.id ? { ...item, qty: item.qty + qty } : item) : [...state.cart, { id: product.id, qty }] }); setAdded(true); }}>Tambah ke keranjang</button></div>{added && <p className="success-note">✓ Produk ditambahkan. <Link to="/keranjang">Lihat keranjang →</Link></p>}<div className="detail-perks"><span>♧ Bahan nyaman</span><span>⌁ Packing aman</span><span>✳ Gaya setiap hari</span></div><a className="text-link" href={`https://wa.me/${WA}`} target="_blank" rel="noreferrer">Tanya ukuran via WhatsApp →</a></div></div></div>; }
function Wishlist() { const { state } = useStore(); const items = state.products.filter(product => state.wishlist.includes(product.id)); return <div className="page-container"><p className="eyebrow">TERSIMPAN UNTUK NANTI</p><h1>Wishlist <em>pilihanmu.</em></h1>{items.length ? <div className="product-grid wishlist-grid">{items.map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><span>♡</span><h2>Belum ada produk tersimpan.</h2><p>Simpan pakaian favoritmu dengan menekan ikon hati.</p><Link to="/produk" className="btn-primary">Jelajahi koleksi</Link></div>}</div>; }
function Cart() { const { state, setState } = useStore(); const items = state.cart.map(row => ({ ...row, product: state.products.find(product => product.id === row.id) })).filter(row => row.product); const total = items.reduce((sum, row) => sum + row.product.price * row.qty, 0); const change = (id, qty) => setState({ ...state, cart: qty < 1 ? state.cart.filter(row => row.id !== id) : state.cart.map(row => row.id === id ? { ...row, qty } : row) }); return <div className="page-container"><p className="eyebrow">TINGGAL SELANGKAH LAGI</p><h1>Keranjang <em>belanja.</em></h1>{items.length ? <div className="cart-layout"><div className="cart-items">{items.map(({ id, qty, product }) => <div className="cart-item" key={id}><div className={`cart-thumb ${product.color}`}><img src={product.image} alt="" onError={event => { event.currentTarget.style.display = 'none'; const fallback = event.currentTarget.nextElementSibling; if (fallback) fallback.style.display = 'grid'; }} />{product.emoji}</div><div className="cart-item-info"><Link to={`/produk/${id}`}>{product.name}</Link><small>{product.category}</small><strong>{rupiah(product.price)}</strong><div className="quantity"><button onClick={() => change(id, qty - 1)}>−</button><span>{qty}</span><button onClick={() => change(id, qty + 1)}>+</button></div></div><button className="remove-btn" onClick={() => change(id, 0)}>Hapus</button></div>)}<Link className="text-link" to="/produk">← Lanjut belanja</Link></div><aside className="order-summary"><h3>Ringkasan pesanan</h3><div><span>Subtotal produk</span><b>{rupiah(total)}</b></div><div><span>Ongkos kirim</span><b>{total >= 350000 ? 'Gratis' : rupiah(18000)}</b></div><div className="summary-total"><span>Total</span><b>{rupiah(total + (total >= 350000 ? 0 : 18000))}</b></div><Link className="btn-primary full-btn" to="/checkout">Lanjut checkout <Icon type="arrow" size={16} /></Link><p className="safe-note">Checkout demo · Pembayaran dikonfirmasi manual</p></aside></div> : <div className="empty-state"><span>🛍️</span><h2>Keranjangmu masih kosong.</h2><Link to="/produk" className="btn-primary">Jelajahi koleksi</Link></div>}</div>; }
function Checkout() { const { state, setState, user } = useStore(); const items = state.cart.map(row => ({ ...row, product: state.products.find(product => product.id === row.id) })).filter(row => row.product); const subtotal = items.reduce((sum, row) => sum + row.product.price * row.qty, 0); const [success, setSuccess] = useState(''); function submit(event) { event.preventDefault(); if (!items.length) return; const data = new FormData(event.currentTarget); const order = { id: `NW-${Date.now().toString().slice(-7)}`, date: new Date().toLocaleDateString('id-ID'), name: data.get('name'), phone: data.get('phone'), address: data.get('address'), payment: data.get('payment'), email: user.email, total: subtotal + (subtotal >= 350000 ? 0 : 18000), items: items.map(row => ({ id: row.id, qty: row.qty })) }; setState({ ...state, orders: [order, ...state.orders], cart: [] }); setSuccess(order.id); } if (success) return <div className="empty-state"><span>✓</span><h2>Pesananmu diterima.</h2><p>Nomor pesanan <b>{success}</b>. Tim kami akan menghubungi melalui WhatsApp untuk konfirmasi.</p><div className="hero-actions"><Link className="btn-primary" to="/pesanan">Lihat pesanan</Link><Link className="text-link" to="/produk">Kembali belanja</Link></div></div>; return <div className="page-container"><p className="eyebrow">INFORMASI PENGIRIMAN</p><h1>Checkout <em>pesanan.</em></h1>{!items.length ? <div className="empty-state"><h2>Keranjangmu masih kosong.</h2><Link to="/produk" className="btn-primary">Jelajahi koleksi</Link></div> : <div className="cart-layout checkout-layout"><form onSubmit={submit} className="checkout-form"><h2>Informasi penerima</h2><label>Nama lengkap<input name="name" defaultValue={user.name} required /></label><label>Nomor WhatsApp<input name="phone" type="tel" required placeholder="08xxxxxxxxxx" /></label><label>Alamat pengiriman<textarea name="address" required rows="3" placeholder="Alamat lengkap, kota, dan kode pos" /></label><h2>Pilih pembayaran</h2><label className="payment-option"><input type="radio" name="payment" value="Transfer Bank" defaultChecked /> Transfer bank <small>Konfirmasi manual</small></label><label className="payment-option"><input type="radio" name="payment" value="COD" /> Bayar di tempat (COD) <small>Konfirmasi manual</small></label><button className="btn-primary full-btn">Buat pesanan <Icon type="arrow" size={16} /></button></form><aside className="order-summary"><h3>Pesananmu</h3>{items.map(row => <div key={row.id}><span>{row.product.name} × {row.qty}</span><b>{rupiah(row.product.price * row.qty)}</b></div>)}<div><span>Ongkos kirim</span><b>{subtotal >= 350000 ? 'Gratis' : rupiah(18000)}</b></div><div className="summary-total"><span>Total</span><b>{rupiah(subtotal + (subtotal >= 350000 ? 0 : 18000))}</b></div></aside></div>}</div>; }
function Auth({ register = false }) {
  const { supabaseConfigured } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [authFocus, setAuthFocus] = useState('');
  const [errorPulse, setErrorPulse] = useState(0);
  const mascotSceneRef = useRef(null);
  const next = searchParams.get('next') || '/akun';

  function trackMascotEyes(event) {
    const pupils = mascotSceneRef.current?.querySelectorAll('.mascot-face i');
    if (!pupils) return;
    pupils.forEach(eye => {
      const bounds = eye.getBoundingClientRect();
      const dx = event.clientX - (bounds.left + bounds.width / 2);
      const dy = event.clientY - (bounds.top + bounds.height / 2);
      const distance = Math.hypot(dx, dy) || 1;
      const movement = Math.min(3, distance / 12);
      eye.style.setProperty('--eye-x', `${(dx / distance * movement).toFixed(2)}px`);
      eye.style.setProperty('--eye-y', `${(dy / distance * movement).toFixed(2)}px`);
    });
  }

  function resetMascotEyes() {
    mascotSceneRef.current?.querySelectorAll('.mascot-face i').forEach(eye => {
      eye.style.removeProperty('--eye-x');
      eye.style.removeProperty('--eye-y');
    });
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email')).trim().toLowerCase();
    const password = String(data.get('password'));
    setSubmitting(true);
    try {
      if (!supabase) throw new Error('Hubungkan Supabase dengan mengisi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env.local, lalu restart server.');
      if (register) {
        const name = String(data.get('name')).trim();
        const { data: result, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (signUpError) throw signUpError;
        if (!result.session) {
          setMessage('Pendaftaran diterima. Periksa email untuk mengonfirmasi akun sebelum masuk.');
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
      navigate(next);
    } catch (authError) {
      setError(authError.message || 'Autentikasi gagal. Silakan coba lagi.');
      setErrorPulse(value => value + 1);
    } finally {
      setSubmitting(false);
    }
  }

  const mascotMood = authFocus === 'password' && !passwordVisible ? 'is-looking-away' : passwordVisible ? 'is-password-visible' : authFocus ? 'is-looking' : '';

  return <div className="auth-shell">
    <section className="auth-art">
      <span className="brand-mark">nw</span>
      <p className="eyebrow">SELAMAT DATANG DI NUSA WEAR</p>
      <p className="eyebrow auth-store-name">This is "SiriousLei-Store"</p>
      <h2>Gaya nyaman,<br /><em>dimulai di sini.</em></h2>
      <p>Masuk atau daftar untuk belanja.</p>
      <div ref={mascotSceneRef} key={errorPulse} className={`auth-mascot-scene ${mascotMood} ${error ? 'has-error' : ''}`} onPointerMove={trackMascotEyes} onPointerLeave={resetMascotEyes} aria-hidden="true">
        <span className="mascot-spark mascot-spark-left">✳</span>
        <span className="mascot-spark mascot-spark-right">✦</span>
        <span className="mascot-alert">Coba lagi!</span>
        <div className="auth-mascot mascot-sage"><span className="mascot-back" /><span className="mascot-arm" /><span className="mascot-face"><i /><i /><b /></span></div>
        <div className="auth-mascot mascot-cream"><span className="mascot-back" /><span className="mascot-arm" /><span className="mascot-face"><i /><i /><b /></span></div>
        <div className="auth-mascot mascot-coral"><span className="mascot-back" /><span className="mascot-arm" /><span className="mascot-face"><i /><i /><b /></span></div>
        <div className="auth-mascot mascot-lime"><span className="mascot-back" /><span className="mascot-arm" /><span className="mascot-face"><i /><i /><b /></span></div>
      </div>
    </section>
    <section className="auth-form-wrap">
      <Link to="/" className="brand auth-brand"><span className="brand-mark">nw</span><span>NUSA<span className="brand-light">WEAR</span><small>SiriousLei Store</small></span></Link>
      <h1>{register ? 'Buat akun baru.' : 'Senang bertemu lagi.'}</h1>
      <p>{register ? 'Daftar untuk melihat koleksi dan menyimpan favoritmu.' : 'Masuk untuk melanjutkan ke koleksi dan pembelian.'}</p>
      <form onSubmit={submit} className="auth-form">
        {register && <label htmlFor="auth-name">Nama lengkap<input id="auth-name" name="name" autoComplete="name" required placeholder="Nama kamu" onFocus={() => setAuthFocus('name')} onChange={() => { setAuthFocus('name'); setError(''); }} /></label>}
        <label htmlFor="auth-email">Email<input id="auth-email" name="email" type="email" autoComplete="email" required placeholder="nama@email.com" onFocus={() => setAuthFocus('email')} onChange={() => { setAuthFocus('email'); setError(''); }} /></label>
        <label htmlFor="auth-password">Kata sandi
          <span className="auth-password-field">
            <input id="auth-password" name="password" type={passwordVisible ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} minLength="8" required placeholder="Minimal 8 karakter" onFocus={() => setAuthFocus('password')} onChange={() => { setAuthFocus('password'); setError(''); }} />
            <button type="button" className="password-visibility" aria-label={passwordVisible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} aria-pressed={passwordVisible} onClick={() => setPasswordVisible(value => !value)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2.5 12s3.2-6 9.5-6 9.5 6 9.5 6-3.2 6-9.5 6-9.5-6-9.5-6Z" />
                <circle cx="12" cy="12" r="2.6" />
                {!passwordVisible && <path d="M4 4 20 20" />}
              </svg>
            </button>
          </span>
        </label>
        {error && <p className="error-note" role="alert">{error}</p>}
        {message && <p className="success-note" role="status">{message}</p>}
        <button className="btn-primary full-btn" disabled={submitting || !supabaseConfigured}>{submitting ? 'Memproses...' : register ? 'Daftar sekarang' : 'Masuk'} <Icon type="arrow" size={16} /></button>
      </form>
      {!supabaseConfigured && <p className="error-note">Supabase belum dikonfigurasi. Isi `.env.local` sebelum mengaktifkan login.</p>}
      <p className="auth-switch">{register ? 'Sudah punya akun?' : 'Belum punya akun?'} <Link to={`${register ? '/masuk' : '/daftar'}?next=${encodeURIComponent(next)}`}>{register ? 'Masuk di sini' : 'Daftar gratis'}</Link></p>
    </section>
  </div>;
}
function Account() {
  const { user, signOut, updateProfile } = useStore();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const name = String(new FormData(event.currentTarget).get('name')).trim();
    const saveError = await updateProfile(name);
    if (saveError) setError(`Gagal memperbarui profil: ${saveError.message}`);
    else setMessage('Profil berhasil diperbarui.');
    setSaving(false);
  }
  return <div className="page-container"><p className="eyebrow">AKUN NUSA WEAR</p><h1>Halo, <em>{user.name.split(' ')[0]}.</em></h1><div className="account-layout"><div className="account-menu"><div className="account-avatar">{user.name[0].toUpperCase()}</div><b>{user.name}</b><small>{user.email}</small><NavLink to="/akun">Profil saya</NavLink><NavLink to="/pesanan">Riwayat pesanan</NavLink><NavLink to="/wishlist">Wishlist</NavLink><button onClick={signOut}>Keluar dari akun</button></div><form className="account-card" onSubmit={saveProfile}><h2>Informasi profil</h2><label>Nama lengkap<input name="name" defaultValue={user.name} required /></label><label>Email<input value={user.email} readOnly /></label>{message && <p className="success-note">✓ {message}</p>}{error && <p className="error-note">{error}</p>}<button className="btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan perubahan'}</button></form></div></div>;
}
function Orders() { const { state, user } = useStore(); const orders = state.orders.filter(order => order.email === user.email); return <div className="page-container"><p className="eyebrow">PESANANMU</p><h1>Riwayat <em>pesanan.</em></h1>{orders.length ? <div className="order-list">{orders.map(order => <article className="order-card" key={order.id}><div className="order-top"><div><b>{order.id}</b><small>{order.date}</small></div><span className="order-status">✓ Diterima</span></div><div className="order-products">{order.items.map(item => { const product = state.products.find(x => x.id === item.id); return <span key={item.id}>{product?.name} × {item.qty}</span>; })}</div><div className="order-bottom"><span>{order.name} · {order.payment}</span><b>{rupiah(order.total)}</b></div></article>)}</div> : <div className="empty-state"><span>📦</span><h2>Belum ada pesanan.</h2><Link to="/produk" className="btn-primary">Lihat koleksi</Link></div>}</div>; }
function About() { return <div className="page-container about-page"><div className="story-copy"><p className="eyebrow">CERITA NUSA WEAR</p><h1>Gaya yang nyaman, <em>setiap hari.</em></h1><p>Nusa Wear adalah contoh brand pakaian lokal dengan koleksi yang dirancang untuk keseharian. Kami percaya pakaian yang nyaman dan mudah dipadukan bisa membuat setiap hari terasa lebih ringan.</p><p>Nama, koleksi, foto, dan detail usaha ini masih berupa contoh. Sesuaikan dengan identitas toko pakaian sebenarnya.</p><Link to="/produk" className="btn-primary">Lihat koleksi <Icon type="arrow" size={16} /></Link></div><div className="about-card"><span>✳</span><b>Pakailah gayamu.</b><small>Contoh toko pakaian lokal</small></div><div className="interview-card"><p className="eyebrow">CATATAN PENGEMBANGAN UMKM</p><h2>10 pertanyaan untuk pemilik toko</h2><p>Isi setelah wawancara langsung untuk melengkapi kebutuhan website usaha.</p><InterviewForm /></div></div>; }
const QUESTIONS = ['Produk pakaian apa yang dijual dan apakah ada variasi ukuran, warna, atau bahan?', 'Siapa pelanggan sasaran dari segi usia, lokasi, gaya, dan perangkat yang digunakan?', 'Kapan pelanggan biasa berbelanja dan apakah mereka ingin checkout cepat?', 'Ke mana pesanan dikirim dan kurir apa yang digunakan? Bagaimana ongkir dihitung?', 'Metode pembayaran apa yang tersedia: transfer, e-wallet, atau COD?', 'Apa logo, warna brand, dan gaya komunikasi toko?', 'Fitur apa yang diperlukan: WhatsApp, wishlist, rekomendasi, diskon, atau blog?', 'Bagaimana stok dan ketersediaan ukuran dikelola?', 'Apakah foto, ukuran, bahan, harga, dan deskripsi produk sudah tersedia?', 'Apa tujuan utama website: meningkatkan penjualan, membangun brand, atau mengotomasi pesanan?'];
function InterviewForm() { const { state, setState } = useStore(); const existing = state.interview || {}; return <details className="interview-details"><summary>Isi formulir wawancara <span>＋</span></summary><form onSubmit={event => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); setState({ ...state, interview: values }); alert('Jawaban wawancara tersimpan di database.'); }}><div className="interview-meta"><label>Nama toko<input name="shop" defaultValue={existing.shop || 'Nusa Wear'} /></label><label>Nama pemilik<input name="owner" defaultValue={existing.owner || ''} placeholder="Isi setelah wawancara" /></label><label>Alamat toko<input name="address" defaultValue={existing.address || ''} placeholder="Alamat UMKM" /></label></div>{QUESTIONS.map((question, i) => <label className="question-row" key={question}><span>{String(i + 1).padStart(2, '0')}</span><span>{question}<textarea name={`q${i + 1}`} defaultValue={existing[`q${i + 1}`] || ''} required placeholder="Jawaban hasil wawancara..." rows="2" /></span></label>)}<button className="btn-primary">Simpan jawaban</button></form></details>; }
function Contact() { return <div className="page-container contact-page"><p className="eyebrow">SERVICE CENTER NUSA WEAR</p><h1>Kami siap <em>membantu.</em></h1><p className="contact-intro">Tanyakan soal ukuran, pengiriman, atau pesanan. Tim kami siap membantu.</p><div className="contact-grid"><a className="contact-card" href={`https://wa.me/${WA}`} target="_blank" rel="noreferrer"><span>☏</span><small>WHATSAPP</small><b>Chat layanan pelanggan</b><p>+62 859-2453-8371 <em>(dummy)</em></p><span className="contact-arrow">→</span></a><a className="contact-card" href={`mailto:${EMAIL}`}><span>✉</span><small>EMAIL SERVICE CENTER</small><b>Kirim email</b><p>{EMAIL}</p><span className="contact-arrow">→</span></a><a className="contact-card" href="https://instagram.com/nusawear.id" target="_blank" rel="noreferrer"><span>◎</span><small>INSTAGRAM</small><b>@nusawear.id</b><p>Akun contoh — sesuaikan dengan toko</p><span className="contact-arrow">→</span></a></div><p className="placeholder-note">Nomor WhatsApp dan akun Instagram masih dummy; ganti sebelum situs dipublikasikan.</p></div>; }
function Newsletter() { const [sent, setSent] = useState(false); return <section className="newsletter"><div><p className="eyebrow">CATATAN DARI NUSA WEAR</p><h2>Koleksi baru, <em>kabar baik.</em></h2><p>Inspirasi gaya dan kabar koleksi terbaru untukmu.</p></div><form onSubmit={event => { event.preventDefault(); setSent(true); }}><input type="email" required placeholder="Alamat email kamu" /><button>{sent ? 'Terima kasih! ✓' : 'Ikuti kabar kami →'}</button><small>Info pilihan, langsung ke inbox-mu.</small></form></section>; }
function Footer() { return <footer className="footer"><div className="footer-main"><div><Link to="/" className="brand footer-brand"><span className="brand-mark">nw</span><span>NUSA<span className="brand-light">WEAR</span><small>SiriousLei Store</small></span></Link><p>Pakaian nyaman untuk hari-hari nyata.<br />Temukan gaya yang terasa seperti dirimu.</p><a className="footer-social" href="https://instagram.com/nusawear.id" target="_blank" rel="noreferrer">◎ &nbsp; Instagram @nusawear.id</a></div><div><b>Jelajahi</b><Link to="/produk">Semua koleksi</Link><Link to="/tentang">Tentang kami</Link><Link to="/kontak">Hubungi kami</Link></div><div><b>Akun</b><Link to="/akun">Akun saya</Link><Link to="/pesanan">Pesanan saya</Link><Link to="/keranjang">Keranjang</Link></div><div><b>Service Center</b><a href={`https://wa.me/${WA}`}>WhatsApp: +62 859-2453-8371</a><a href={`mailto:${EMAIL}`}>{EMAIL}</a><a href="https://instagram.com/nusawear.id" target="_blank" rel="noreferrer">Instagram: @nusawear.id</a><small>Senin – Sabtu, 08.00 – 17.00 WIB</small></div></div><div className="footer-bottom"><span>© 2026 Nusa Wear. Pakai gayamu ♡</span><span>Transfer bank · COD (demo)</span></div><div className="demo-disclaimer">Nusa Wear adalah brand contoh. Foto produk memerlukan koneksi internet. Nomor WhatsApp dan Instagram masih dummy.</div></footer>; }
function Home() {
  const { state } = useStore();
  const [activeFeature, setActiveFeature] = useState(0);
  const feature = HOME_FEATURES[activeFeature];
  return <>
    <section className="home-feature" aria-label="Sorotan Nusa Wear">
      <img className="home-feature-image" src={feature.image} alt={feature.alt} key={feature.image} />
      <div className="home-feature-shade" />
      <div className="home-feature-copy" aria-live="polite">
        <p className="home-feature-eyebrow">{feature.eyebrow}</p>
        <h1>{feature.title}</h1>
        <p className="home-feature-description">{feature.description}</p>
        <Link className="home-feature-link" to={feature.link}>{feature.action}<Icon type="arrow" size={18} /></Link>
      </div>
      <div className="home-feature-controls">
        <button type="button" aria-label="Sorotan sebelumnya" onClick={() => setActiveFeature((activeFeature + HOME_FEATURES.length - 1) % HOME_FEATURES.length)}>←</button>
        <div className="home-feature-dots" aria-label="Pilih sorotan">{HOME_FEATURES.map((item, index) => <button type="button" key={item.eyebrow} aria-label={`Sorotan ${index + 1}: ${item.eyebrow}`} aria-pressed={activeFeature === index} onClick={() => setActiveFeature(index)} />)}</div>
        <span>0{activeFeature + 1} <span>/ 0{HOME_FEATURES.length}</span></span>
        <button type="button" aria-label="Sorotan berikutnya" onClick={() => setActiveFeature((activeFeature + 1) % HOME_FEATURES.length)}>→</button>
      </div>
    </section>
    <section className="promise-strip"><div><span className="promise-icon">♧</span><span><b>Bahan pilihan</b><small>Nyaman untuk setiap hari</small></span></div><div><span className="promise-icon">✳</span><span><b>Potongan versatile</b><small>Mudah dipadukan</small></span></div><div><span className="promise-icon">♡</span><span><b>Komunitas hangat</b><small>Berbagi inspirasi gaya</small></span></div><div><span className="promise-icon">⌁</span><span><b>Pengiriman nasional</b><small>Belanja dari mana saja</small></span></div></section>
    <section className="section product-section" id="produk"><div className="section-head"><div><p className="eyebrow"><span className="eyebrow-line" /> PILIHAN MINGGU INI</p><h2>Yang paling <em>disukai.</em></h2></div><Link className="all-link" to="/produk">Lihat semua produk <Icon type="arrow" size={16} /></Link></div><div className="category-pills"><Link to="/produk">Semua</Link><Link to="/produk?kategori=Kaos">Kaos</Link><Link to="/produk?kategori=Kemeja">Kemeja</Link><Link to="/produk?kategori=Outerwear">Outerwear</Link><span>✦ Koleksi nyaman sepanjang hari</span></div><div className="product-grid">{state.products.slice(0, 4).map(product => <ProductCard key={product.id} product={product} />)}</div></section>
    <section className="home-community"><div className="home-community-photo"><img src="/images/community-style.jpg" alt="Komunitas berbagi inspirasi gaya" /></div><div className="home-community-copy"><p className="eyebrow">LEBIH DARI SEKADAR PAKAIAN</p><h2>Temukan teman,<br /><em>ceritakan gayamu.</em></h2><p>Ikuti pop-up, workshop, dan obrolan komunitas. Bagikan outfit favoritmu dan temukan inspirasi dari sesama pecinta gaya.</p><div className="hero-actions"><Link className="btn-primary" to="/event">Jelajahi event <Icon type="arrow" size={16} /></Link><Link className="text-link" to="/komunitas">Masuk komunitas <span>→</span></Link></div></div></section>
    <section className="home-event-preview"><div><p className="eyebrow">SAVE THE DATE</p><h2>Agenda seru <em>sebentar lagi.</em></h2><p>Ketemu langsung, saling tukar inspirasi, dan dukung brand lokal bersama Nusa.</p></div><Link className="all-link" to="/event">Lihat semua event <Icon type="arrow" size={16} /></Link><div className="home-event-row">{EVENTS.slice(0, 2).map(item => <article key={item.id}><span>{item.date}</span><b>{item.title}</b><small>{item.location}</small></article>)}</div></section>
    <Newsletter />
  </>;
}
function EventsPage() {
  const { state, setState, user } = useStore();
  const registrations = state.eventRegistrations || [];
  return <div className="page-container program-page">
    <p className="eyebrow"><span className="eyebrow-line" /> NUSA WEAR HAPPENINGS</p>
    <div className="page-title-row"><div><h1>Ketemu, ngobrol, <em>berbagi gaya.</em></h1><p>Agenda komunitas dan pengalaman seru yang bisa kamu ikuti.</p></div><span className="results-count">{EVENTS.length} agenda</span></div>
    <div className="events-grid">{EVENTS.map(item => {
      const registered = registrations.some(registration => registration === item.id || registration?.eventId === item.id);
      return <article className="event-card" key={item.id}>
        <Link to={`/event/${item.id}`} className="event-image"><img src={item.image} alt="" loading="lazy" /><span>{item.type}</span></Link>
        <div className="event-copy"><p className="event-date">{item.date} <span>·</span> {item.location}</p><h2><Link to={`/event/${item.id}`}>{item.title}</Link></h2><p>{item.description}</p><Link className={registered ? 'event-join registered' : 'event-join'} to={`/event/${item.id}`}>{registered ? '✓ Lihat tiketmu' : 'Detail & pendaftaran'} <span>→</span></Link></div>
      </article>;
    })}</div>
    <div className="event-note"><span>✦</span><p>Daftar dengan akunmu untuk mendapatkan tiket QR. Tanggal dan informasi acara dapat diperbarui sesuai agenda toko.</p></div>
  </div>;
}
function createEventTicket(eventId, user) {
  return { eventId, ticketCode: `NW-${crypto.randomUUID()}`, attendeeName: user.name, registeredAt: new Date().toISOString() };
}
function EventDetailPage() {
  const { id } = useParams();
  const { state, setState, user } = useStore();
  const navigate = useNavigate();
  const event = EVENTS.find(item => item.id === id);
  const registrations = state.eventRegistrations || [];
  const registration = registrations.find(item => item === id || item?.eventId === id);

  useEffect(() => {
    if (!event || !user || typeof registration !== 'string') return;
    setState(current => ({
      ...current,
      eventRegistrations: (current.eventRegistrations || []).map(item => item === id ? createEventTicket(id, user) : item),
    }));
  }, [event, id, registration, setState, user]);

  if (!event) return <div className="page-container"><div className="empty-state"><h1>Event tidak ditemukan</h1><Link className="btn-primary" to="/event">Kembali ke event</Link></div></div>;

  function register() {
    if (!user) {
      navigate(`/masuk?next=${encodeURIComponent(`/event/${event.id}`)}`);
      return;
    }
    if (registration) return;
    setState(current => ({
      ...current,
      eventRegistrations: [...(current.eventRegistrations || []), createEventTicket(event.id, user)],
    }));
  }

  return <div className="page-container event-detail-page">
    <Link className="event-back-link" to="/event">← Semua event</Link>
    <section className="event-detail-hero">
      <img src={event.image} alt="" />
      <div className="event-detail-overlay"><span className="event-type-pill">{event.type}</span><p className="event-date">{event.date} · {event.time}</p><h1>{event.title}</h1><p>{event.description}</p></div>
    </section>
    <div className="event-detail-grid">
      <div className="event-detail-content">
        <section className="event-info-panel"><h2>Informasi acara</h2><div className="event-info-items"><p><span>◷</span><span><b>Waktu</b>{event.date}, {event.time}</span></p><p><span>⌖</span><span><b>Lokasi</b>{event.location}</span></p><p><span>♧</span><span><b>Format</b>{event.type}</span></p></div></section>
        <section className="event-info-panel"><h2>Susunan acara</h2><ol className="event-agenda">{event.agenda.map(item => <li key={item}>{item}</li>)}</ol></section>
        <section className="event-info-panel"><h2>Yang perlu disiapkan</h2><ul className="event-notes">{event.notes.map(item => <li key={item}>{item}</li>)}</ul></section>
      </div>
      <aside className="event-register-panel"><p className="eyebrow">JADI BAGIAN DARI KESERUANNYA</p><h2>{registration ? 'Sampai jumpa di sana!' : 'Amankan tempatmu.'}</h2><p>{registration ? 'Pendaftaranmu tersimpan. Simpan tiket QR ini dan tunjukkan kepada panitia saat check-in.' : 'Daftar gratis dan dapatkan tiket digital dengan QR code untuk ditunjukkan saat check-in.'}</p>{registration?.ticketCode ? <EventTicket event={event} ticket={registration} /> : registration ? <p className="event-ticket-loading">Menyiapkan tiketmu...</p> : <button className="btn-primary event-register-button" onClick={register}>{user ? 'Daftar & dapatkan tiket' : 'Masuk untuk mendaftar'} <span>→</span></button>}<small>QR berisi kode tiket unik, bukan data pribadi.</small></aside>
    </div>
  </div>;
}
function EventTicket({ event, ticket }) {
  const [qrCode, setQrCode] = useState('');
  const [qrError, setQrError] = useState('');

  useEffect(() => {
    let active = true;
    setQrError('');
    QRCode.toDataURL(ticket.ticketCode, { width: 220, margin: 1, errorCorrectionLevel: 'M' })
      .then(dataUrl => { if (active) setQrCode(dataUrl); })
      .catch(error => { if (active) setQrError(`QR tiket gagal dibuat: ${error.message}`); });
    return () => { active = false; };
  }, [ticket.ticketCode]);

  return <div className="event-ticket">
    <div className="event-ticket-heading"><span>TIKET DIGITAL · NUSA WEAR</span><b>1 PESERTA</b></div>
    {qrError ? <p className="store-error" role="alert">{qrError}</p> : qrCode ? <img className="event-ticket-qr" src={qrCode} alt={`QR tiket ${ticket.ticketCode}`} /> : <div className="event-ticket-qr-placeholder">Menyiapkan QR...</div>}
    <strong className="event-ticket-name">{ticket.attendeeName}</strong>
    <span className="event-ticket-event">{event.title}</span>
    <span className="event-ticket-code">{ticket.ticketCode}</span>
    <span className="event-ticket-meta">{event.date} · {event.time}</span>
    <div className="event-ticket-actions"><button type="button" onClick={() => window.print()}>Cetak tiket</button></div>
  </div>;
}
function CommunityPage() {
  const { user, supabaseConfigured } = useStore();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [activeTopic, setActiveTopic] = useState('semua');
  const [selectedTopic, setSelectedTopic] = useState('outfit-harian');
  const [refreshKey, setRefreshKey] = useState(0);
  const [feedLoading, setFeedLoading] = useState(Boolean(supabaseConfigured));
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const visiblePosts = posts.filter(post => activeTopic === 'semua' || post.topic === activeTopic);

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      setPosts(COMMUNITY_POSTS);
      setFeedLoading(false);
      return undefined;
    }
    let active = true;
    async function loadCommunity() {
      setFeedLoading(true);
      setError('');
      const [postResult, likeResult] = await Promise.all([
        supabase.from('community_posts').select('id, author_id, author_name, caption, topic, image_url, created_at').order('created_at', { ascending: false }),
        supabase.from('community_likes').select('post_id, user_id'),
      ]);
      if (!active) return;
      if (postResult.error || likeResult.error) {
        const loadError = postResult.error || likeResult.error;
        const missingTable = ['PGRST205', '42P01'].includes(loadError.code)
          || loadError.message.includes('schema cache');
        setError(missingTable
          ? 'Database komunitas belum siap. Jalankan ulang seluruh supabase/schema.sql di Supabase → SQL Editor → Run, lalu tekan Muat ulang cerita.'
          : `Gagal memuat komunitas: ${loadError.message}`);
        setFeedLoading(false);
        return;
      }
      const likeRows = likeResult.data || [];
      setPosts((postResult.data || []).map(post => ({
        id: post.id,
        author: post.author_name,
        authorId: post.author_id,
        location: 'Komunitas Nusa',
        caption: post.caption,
        image: post.image_url || COMMUNITY_DEFAULT_IMAGE,
        topic: post.topic || 'outfit-harian',
        likes: likeRows.filter(like => like.post_id === post.id).length,
      })));
      setLikes(likeRows.filter(like => like.user_id === user?.id).map(like => like.post_id));
      setFeedLoading(false);
    }
    loadCommunity();
    return () => { active = false; };
  }, [supabaseConfigured, user?.id, refreshKey]);

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  async function publish(event) {
    event.preventDefault();
    if (!user) {
      navigate(`/masuk?next=${encodeURIComponent('/komunitas')}`);
      return;
    }
    if (!supabase) {
      setError('Supabase belum dikonfigurasi. Hubungkan Supabase agar ceritamu tersimpan dan bisa dilihat semua orang.');
      return;
    }
    const form = event.currentTarget;
    const caption = String(new FormData(form).get('caption') || '').trim();
    const topic = String(new FormData(form).get('topic') || 'outfit-harian');
    if (!caption) return;
    if (photo && (!['image/jpeg', 'image/png', 'image/webp'].includes(photo.type) || photo.size > 5 * 1024 * 1024)) {
      setError('Pilih foto JPG, PNG, atau WebP dengan ukuran maksimal 5 MB.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    setError('');
    let uploadedPath = '';
    let image = COMMUNITY_DEFAULT_IMAGE;
    if (photo) {
      const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[photo.type];
      uploadedPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('community-images').upload(uploadedPath, photo, {
        cacheControl: '3600',
        contentType: photo.type,
        upsert: false,
      });
      if (uploadError) {
        setError(`Gagal mengunggah foto: ${uploadError.message}`);
        setSubmitting(false);
        return;
      }
      image = supabase.storage.from('community-images').getPublicUrl(uploadedPath).data.publicUrl;
    }
    const { data, error: insertError } = await supabase.from('community_posts').insert({
      author_id: user.id,
      author_name: user.name,
      caption,
      topic,
      image_url: image,
    }).select('id, author_id, author_name, caption, topic, image_url, created_at').single();
    if (insertError) {
      const missingTable = ['PGRST205', '42P01'].includes(insertError.code)
        || insertError.message.includes('schema cache');
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage.from('community-images').remove([uploadedPath]);
        setError(missingTable
          ? 'Database komunitas belum siap. Jalankan ulang seluruh supabase/schema.sql di Supabase → SQL Editor → Run, lalu coba bagikan lagi.'
          : cleanupError
          ? `Gagal menyimpan cerita: ${insertError.message}. Foto sementara juga gagal dihapus: ${cleanupError.message}`
          : `Gagal menyimpan cerita: ${insertError.message}`);
      } else {
        setError(missingTable
          ? 'Database komunitas belum siap. Jalankan ulang seluruh supabase/schema.sql di Supabase → SQL Editor → Run, lalu coba bagikan lagi.'
          : `Gagal menyimpan cerita: ${insertError.message}`);
      }
      setSubmitting(false);
      return;
    }
    setPosts(current => [{ id: data.id, author: data.author_name, authorId: data.author_id, location: 'Komunitas Nusa', caption: data.caption, topic: data.topic, image: data.image_url || COMMUNITY_DEFAULT_IMAGE, likes: 0 }, ...current]);
    form.reset();
    setPhoto(null);
    setPhotoPreview('');
    setMessage('Ceritamu berhasil dibagikan ke komunitas.');
    setSubmitting(false);
  }

  async function toggleLike(postId) {
    if (!user) {
      navigate(`/masuk?next=${encodeURIComponent('/komunitas')}`);
      return;
    }
    if (!supabase) {
      setError('Hubungkan Supabase untuk menyukai cerita komunitas.');
      return;
    }
    setError('');
    const liked = likes.includes(postId);
    const result = liked
      ? await supabase.from('community_likes').delete().eq('post_id', postId).eq('user_id', user.id)
      : await supabase.from('community_likes').insert({ post_id: postId, user_id: user.id });
    if (result.error) {
      setError(`Gagal memperbarui suka: ${result.error.message}`);
      return;
    }
    setLikes(current => liked ? current.filter(id => id !== postId) : [...current, postId]);
    setPosts(current => current.map(post => post.id === postId ? { ...post, likes: post.likes + (liked ? -1 : 1) } : post));
  }

  return <div className="page-container community-page">
    <p className="eyebrow"><span className="eyebrow-line" /> NUSA WEAR COMMUNITY</p>
    <div className="community-intro"><div><h1>Gaya kita, <em>cerita kita.</em></h1><p>Tempat berbagi inspirasi outfit, saling kenal, dan merayakan gaya yang terasa paling kamu.</p></div><div className="community-cube" aria-hidden="true"><span className="cube-top" /><span className="cube-left" /><span className="cube-right" /><b>NW</b></div></div>
    <section className="community-rooms" aria-label="Pilih ruang komunitas">
      <div className="community-rooms-heading"><div><p className="eyebrow">TEMUKAN RUANGMU</p><h2>Komunitas berdasarkan minat.</h2></div><span>0{COMMUNITY_TOPICS.length - 1} RUANG</span></div>
      <div className="community-topic-grid">{COMMUNITY_TOPICS.map((topic, index) => {
        const count = topic.id === 'semua' ? posts.length : posts.filter(post => post.topic === topic.id).length;
        return <button type="button" className={`community-topic-card${activeTopic === topic.id ? ' active' : ''}`} onClick={() => { setActiveTopic(topic.id); if (topic.id !== 'semua') setSelectedTopic(topic.id); }} aria-pressed={activeTopic === topic.id} key={topic.id}>
          <span className="topic-cube" aria-hidden="true">{topic.mark}</span><span className="topic-card-copy"><b>{topic.name}</b><small>{topic.description}</small><span>{count} cerita <span aria-hidden="true">↗</span></span></span><span className="topic-index">0{index + 1}</span>
        </button>;
      })}</div>
    </section>
    <div className="community-content">
      <section className="community-feed"><div className="community-feed-head"><div><p className="eyebrow">RUANG TERPILIH</p><h2>{COMMUNITY_TOPICS.find(topic => topic.id === activeTopic)?.name}</h2><p>Inspirasi nyata dari teman-teman Nusa.</p></div><div className="community-feed-actions"><span>{visiblePosts.length} cerita</span><button type="button" onClick={() => { setError(''); setRefreshKey(value => value + 1); }} disabled={feedLoading}>{feedLoading ? 'Memuat...' : '↻ Muat ulang cerita'}</button></div></div>
        {feedLoading ? <p className="community-status">Memuat cerita komunitas...</p> : null}
        {!feedLoading && !error && !visiblePosts.length && <div className="community-status">Belum ada cerita di ruang ini. Jadilah yang pertama berbagi inspirasi!</div>}
        <div className="community-grid">{visiblePosts.map(post => {
          const liked = likes.includes(post.id);
          return <article className="community-card" key={post.id}><img src={post.image || COMMUNITY_DEFAULT_IMAGE} alt={`Inspirasi gaya dari ${post.author}`} loading="lazy" /><div className="community-card-body"><div className="community-author"><span>{post.author[0]}</span><div><b>{post.author}</b><small>{post.location}</small></div></div><p>{post.caption}</p><button className={liked ? 'community-like liked' : 'community-like'} onClick={() => toggleLike(post.id)} aria-label={liked ? 'Batalkan suka' : 'Suka cerita'}>♡ <span>{post.likes}</span> suka</button></div></article>;
        })}</div>
      </section>
      <aside className="community-share"><span className="community-share-cube" aria-hidden="true">✳</span><p className="eyebrow">RUANG UNTUKMU</p><h2>Punya gaya yang ingin dibagikan?</h2><p>Ceritakan inspirasi outfit atau momen favoritmu. Bikin komunitas ini tumbuh bersama.</p><form onSubmit={publish}><label htmlFor="community-caption">Ceritamu</label><textarea id="community-caption" name="caption" rows="4" maxLength="220" required disabled={!user} placeholder={user ? 'Hari ini aku pakai...' : 'Masuk terlebih dahulu untuk menulis cerita.'} /><label className="community-photo-label" htmlFor="community-topic">Pilih ruang komunitas</label><select className="community-topic-select" id="community-topic" name="topic" value={selectedTopic} disabled={!user} onChange={event => setSelectedTopic(event.target.value)}>{COMMUNITY_TOPICS.filter(topic => topic.id !== 'semua').map(topic => <option key={topic.id} value={topic.id}>{topic.name}</option>)}</select><label className="community-photo-label" htmlFor="community-photo">Foto outfit <span>(opsional)</span></label><input id="community-photo" className="community-photo-input" type="file" accept="image/jpeg,image/png,image/webp" disabled={!user} onChange={event => { const selected = event.target.files?.[0] || null; setPhoto(selected); setPhotoPreview(selected ? URL.createObjectURL(selected) : ''); }} />{photoPreview && <img className="community-photo-preview" src={photoPreview} alt="Pratinjau foto yang akan dibagikan" />}<div className="share-footer"><small>JPG, PNG, WebP · maks. 5 MB<br />Tanpa foto, gambar default dipakai.</small><button className="btn-primary" disabled={submitting || !user}>{submitting ? 'Menyimpan...' : 'Bagikan cerita'}</button></div></form>{!user && <Link className="community-login-cta" to={`/masuk?next=${encodeURIComponent('/komunitas')}`}>Masuk untuk berbagi cerita <span>→</span></Link>}{message && <p className="success-note" role="status">✓ {message}</p>}{error && <div className="community-error" role="alert"><p>{error}</p>{error.includes('Database komunitas belum siap') && <p>Buka Supabase → SQL Editor, jalankan seluruh isi `supabase/schema.sql`, lalu tekan “Muat ulang cerita”.</p>}</div>}{!user && <small className="share-login">Setelah masuk, cerita dan fotomu bisa dibagikan ke seluruh komunitas.</small>}</aside>
    </div>
  </div>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><StoreProvider><App /></StoreProvider></BrowserRouter></React.StrictMode>);
