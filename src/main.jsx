import React, { createContext, useContext, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import './style.css';
import { supabase, supabaseConfigured } from './supabase.js';

const WA = '6281234567890'; // Nomor WhatsApp dummy, silakan diganti.
const EMAIL = 'muhammadfahri0627@gmail.com';
const PRODUCTS = [
  { id: 'kaos-oversize', name: 'Kaos Oversize Essential', category: 'Kaos', price: 129000, oldPrice: 159000, stock: 24, sold: 128, tag: 'Terlaris', color: 'peach', emoji: '👕', image: '/images/kaos-oversize.jpg', description: 'Kaos katun combed 24s yang lembut, nyaman, dan jatuh dengan pas. Potongan relaxed fit untuk gaya santai setiap hari.' },
  { id: 'kemeja-linen', name: 'Kemeja Linen Aruna', category: 'Kemeja', price: 239000, oldPrice: 279000, stock: 12, sold: 96, tag: 'Pilihan kami', color: 'sand', emoji: '👔', image: '/images/kemeja-linen.jpg', description: 'Kemeja bertekstur linen blend yang ringan dan breathable. Siluet clean, mudah dipadukan untuk tampilan kasual maupun semi formal.' },
  { id: 'outer-denim', name: 'Outer Denim Kota', category: 'Outerwear', price: 329000, oldPrice: null, stock: 8, sold: 74, tag: 'Stok terbatas', color: 'mint', emoji: '🧥', image: '/images/outer-denim.jpg', description: 'Jaket denim ringan dengan detail saku fungsional dan jahitan rapi. Layering favorit untuk menemani aktivitas dari pagi sampai malam.' },
  { id: 'hoodie-essential', name: 'Hoodie Essential', category: 'Outerwear', price: 299000, oldPrice: 349000, stock: 15, sold: 63, tag: 'Diskon', color: 'lavender', emoji: '🧥', image: '/images/hoodie-essential.jpg', description: 'Hoodie fleece premium yang hangat tapi tetap ringan. Dilengkapi kantong depan dan potongan unisex yang mudah dipadukan.' },
  { id: 'celana-chino', name: 'Celana Chino Harian', category: 'Celana', price: 269000, oldPrice: null, stock: 19, sold: 51, tag: '', color: 'yellow', emoji: '👖', image: '/images/celana-chino.jpg', description: 'Celana chino dengan bahan stretch yang nyaman untuk bergerak. Potongan tapered memberi tampilan rapi tanpa terasa kaku.' },
  { id: 'blouse-senja', name: 'Blouse Senja', category: 'Atasan', price: 219000, oldPrice: null, stock: 10, sold: 42, tag: 'Baru', color: 'coral', emoji: '👚', image: '/images/blouse-senja.jpg', description: 'Blouse ringan dengan detail kerah lembut dan potongan yang nyaman. Pilihan manis untuk bekerja maupun berkumpul bersama teman.' },
];
const EVENTS = [
  { id: 'style-swap', date: '28 Nov 2026', type: 'Community meetup', title: 'Style Swap: Beri Gaya Baru pada Pakaian Lama', location: 'M Bloc Space, Jakarta', image: '/images/community-style.jpg', description: 'Bawa satu pakaian yang masih layak, pulang dengan inspirasi baru. Ada sesi mix & match dan mini market brand lokal.' },
  { id: 'weekend-market', date: '05 Des 2026', type: 'Pop-up market', title: 'Nusa Weekend Market', location: 'Urban Forest Cipete, Jakarta', image: '/images/hero-style.jpg', description: 'Kenalan langsung dengan koleksi Nusa Wear, cek bahan, coba ukuran, dan nikmati penawaran khusus di booth kami.' },
  { id: 'closet-talk', date: '12 Des 2026', type: 'Workshop', title: 'Closet Talk: Gaya Lebih Sadar', location: 'Online · Google Meet', image: '/images/kaos-oversize.jpg', description: 'Obrolan santai bersama stylist tentang membangun lemari kapsul yang lebih personal dan mudah dipakai ulang.' },
];
const COMMUNITY_POSTS = [
  { id: 'look-01', author: 'Nadia P.', location: 'Bandung', caption: 'Layering simpel untuk hari yang jadwalnya padat. Kuncinya: pilih bahan yang tetap nyaman bergerak. ✨', image: '/images/community-style.jpg', likes: 24 },
  { id: 'look-02', author: 'Raka A.', location: 'Jakarta', caption: 'Satu kemeja linen, bisa dibawa dari meeting sampai nongkrong sore. #GayaSehariHari', image: '/images/kemeja-linen.jpg', likes: 18 },
  { id: 'look-03', author: 'Salsa R.', location: 'Yogyakarta', caption: 'Pakai yang bikin nyaman, lalu jadikan harimu milikmu sendiri. 🌿', image: '/images/hero-style.jpg', likes: 32 },
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
  return <><div className="announcement">Koleksi baru sudah hadir <span>✳</span> Gratis ongkir min. belanja Rp350.000 <span className="announcement-extra">·</span> <Link to="/event">Lihat event mendatang →</Link></div>{storeError && <p className="store-error" role="alert">{storeError}</p>}<header className="header"><div className="nav-wrap"><Link to="/" className="brand"><span className="brand-mark">nw</span><span>NUSA<span className="brand-light">WEAR</span><small>PAKAI GAYAMU, SETIAP HARI</small></span></Link><nav className={menu ? 'nav-links open' : 'nav-links'}><NavLink to="/" onClick={() => setMenu(false)}>Beranda</NavLink><NavLink to="/produk" onClick={() => setMenu(false)}>Koleksi</NavLink><NavLink to="/event" onClick={() => setMenu(false)}>Event</NavLink><NavLink to="/komunitas" onClick={() => setMenu(false)}>Komunitas</NavLink></nav><form className="searchbar" onSubmit={event => { event.preventDefault(); navigate(`/produk?q=${encodeURIComponent(search)}`); }}><Icon type="search" /><input placeholder="Cari pakaian favoritmu..." value={search} onChange={event => setSearch(event.target.value)} /><kbd>↵</kbd></form><div className="nav-actions"><Link className="icon-btn" title="Wishlist" to="/wishlist"><Icon type="heart" /></Link><Link className="icon-btn bag-btn" title="Keranjang" to="/keranjang"><Icon type="bag" />{count > 0 && <span className="badge-count">{count}</span>}</Link><Link className="profile-link" to={user ? '/akun' : '/masuk'}><Icon type="user" /><span>{user ? 'Akun saya' : 'Masuk'}</span></Link><button className="mobile-menu" onClick={() => setMenu(!menu)} aria-label="Buka menu"><Icon type="menu" /></button></div></div></header><main><Routes><Route path="/" element={<Home />} /><Route path="/masuk" element={<Auth />} /><Route path="/daftar" element={<Auth register />} /><Route path="/tentang" element={<About />} /><Route path="/kontak" element={<Contact />} /><Route path="/event" element={<EventsPage />} /><Route path="/komunitas" element={<CommunityPage />} /><Route path="/produk" element={<Products />} /><Route path="/produk/:id" element={<Product />} /><Route path="/wishlist" element={<Protected><Wishlist /></Protected>} /><Route path="/keranjang" element={<Protected><Cart /></Protected>} /><Route path="/checkout" element={<Protected><Checkout /></Protected>} /><Route path="/pesanan" element={<Protected><Orders /></Protected>} /><Route path="/akun" element={<Protected><Account /></Protected>} /><Route path="*" element={<Home />} /></Routes></main><Footer /></>;
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
function Products() { const { state } = useStore(); const query = new URLSearchParams(location.search).get('q') || ''; const [category, setCategory] = useState('Semua'); const filtered = state.products.filter(p => (!query || `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase())) && (category === 'Semua' || p.category === category)); return <div className="page-container"><p className="eyebrow"><span className="eyebrow-line" /> KOLEKSI NUSA WEAR</p><div className="page-title-row"><div><h1>Temukan <em>gayamu.</em></h1><p>Pilihan pakaian yang nyaman untuk menemani setiap harimu.</p></div><span className="results-count">{filtered.length} produk</span></div><div className="category-pills product-filter">{['Semua', 'Kaos', 'Kemeja', 'Atasan', 'Outerwear', 'Celana'].map(item => <button className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div>{filtered.length ? <div className="product-grid">{filtered.map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><span>👕</span><h2>Produk tidak ditemukan.</h2><Link to="/produk" className="btn-primary">Lihat semua koleksi</Link></div>}</div>; }
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
  const next = searchParams.get('next') || '/akun';

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
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="auth-shell"><div className="auth-art"><span className="auth-art-emoji">✳</span><p className="eyebrow">SELAMAT DATANG DI NUSA WEAR</p><h2>Gaya nyaman,<br /><em>dimulai di sini.</em></h2><p>Masuk atau daftar untuk melihat koleksi dan melanjutkan belanja.</p></div><div className="auth-form-wrap"><Link to="/" className="brand auth-brand"><span className="brand-mark">nw</span><span>NUSA<span className="brand-light">WEAR</span><small>PAKAI GAYAMU, SETIAP HARI</small></span></Link><h1>{register ? 'Buat akun baru.' : 'Senang bertemu lagi.'}</h1><p>{register ? 'Daftar untuk melihat koleksi dan menyimpan favoritmu.' : 'Masuk untuk melanjutkan ke koleksi dan pembelian.'}</p><form onSubmit={submit} className="auth-form">{register && <label>Nama lengkap<input name="name" required placeholder="Nama kamu" /></label>}<label>Email<input name="email" type="email" required placeholder="nama@email.com" /></label><label>Kata sandi<input name="password" type="password" minLength="8" required placeholder="Minimal 8 karakter" /></label>{error && <p className="error-note">{error}</p>}{message && <p className="success-note">{message}</p>}<button className="btn-primary full-btn" disabled={submitting || !supabaseConfigured}>{submitting ? 'Memproses...' : register ? 'Daftar sekarang' : 'Masuk'} <Icon type="arrow" size={16} /></button></form>{!supabaseConfigured && <p className="error-note">Supabase belum dikonfigurasi. Isi `.env.local` sebelum mengaktifkan login.</p>}<p className="auth-switch">{register ? 'Sudah punya akun?' : 'Belum punya akun?'} <Link to={`${register ? '/masuk' : '/daftar'}?next=${encodeURIComponent(next)}`}>{register ? 'Masuk di sini' : 'Daftar gratis'}</Link></p><small className="local-note">Password dikelola Supabase Auth dan tidak disimpan di data toko.</small></div></div>;
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
function Contact() { return <div className="page-container contact-page"><p className="eyebrow">SERVICE CENTER NUSA WEAR</p><h1>Kami siap <em>membantu.</em></h1><p className="contact-intro">Tanyakan soal ukuran, pengiriman, atau pesanan. Tim kami siap membantu.</p><div className="contact-grid"><a className="contact-card" href={`https://wa.me/${WA}`} target="_blank" rel="noreferrer"><span>☏</span><small>WHATSAPP</small><b>Chat layanan pelanggan</b><p>+62 812-3456-7890 <em>(dummy)</em></p><span className="contact-arrow">→</span></a><a className="contact-card" href={`mailto:${EMAIL}`}><span>✉</span><small>EMAIL SERVICE CENTER</small><b>Kirim email</b><p>{EMAIL}</p><span className="contact-arrow">→</span></a><a className="contact-card" href="https://instagram.com/nusawear.id" target="_blank" rel="noreferrer"><span>◎</span><small>INSTAGRAM</small><b>@nusawear.id</b><p>Akun contoh — sesuaikan dengan toko</p><span className="contact-arrow">→</span></a></div><p className="placeholder-note">Nomor WhatsApp dan akun Instagram masih dummy; ganti sebelum situs dipublikasikan.</p></div>; }
function Newsletter() { const [sent, setSent] = useState(false); return <section className="newsletter"><div><p className="eyebrow">CATATAN DARI NUSA WEAR</p><h2>Koleksi baru, <em>kabar baik.</em></h2><p>Inspirasi gaya dan kabar koleksi terbaru untukmu.</p></div><form onSubmit={event => { event.preventDefault(); setSent(true); }}><input type="email" required placeholder="Alamat email kamu" /><button>{sent ? 'Terima kasih! ✓' : 'Ikuti kabar kami →'}</button><small>Info pilihan, langsung ke inbox-mu.</small></form></section>; }
function Footer() { return <footer className="footer"><div className="footer-main"><div><Link to="/" className="brand footer-brand"><span className="brand-mark">nw</span><span>NUSA<span className="brand-light">WEAR</span><small>PAKAI GAYAMU, SETIAP HARI</small></span></Link><p>Pakaian nyaman untuk hari-hari nyata.<br />Temukan gaya yang terasa seperti dirimu.</p><a className="footer-social" href="https://instagram.com/nusawear.id" target="_blank" rel="noreferrer">◎ &nbsp; Instagram @nusawear.id</a></div><div><b>Jelajahi</b><Link to="/produk">Semua koleksi</Link><Link to="/tentang">Tentang kami</Link><Link to="/kontak">Hubungi kami</Link></div><div><b>Akun</b><Link to="/akun">Akun saya</Link><Link to="/pesanan">Pesanan saya</Link><Link to="/keranjang">Keranjang</Link></div><div><b>Service Center</b><a href={`https://wa.me/${WA}`}>WhatsApp: +62 812-3456-7890</a><a href={`mailto:${EMAIL}`}>{EMAIL}</a><a href="https://instagram.com/nusawear.id" target="_blank" rel="noreferrer">Instagram: @nusawear.id</a><small>Senin – Sabtu, 08.00 – 17.00 WIB</small></div></div><div className="footer-bottom"><span>© 2026 Nusa Wear. Pakai gayamu ♡</span><span>Transfer bank · COD (demo)</span></div><div className="demo-disclaimer">Nusa Wear adalah brand contoh. Foto produk memerlukan koneksi internet. Nomor WhatsApp dan Instagram masih dummy.</div></footer>; }
function Home() {
  const { state } = useStore();
  return <>
    <section className="hero"><div className="hero-copy">
      <div className="eyebrow"><span className="eyebrow-line" /> NUSA WEAR · EVERYDAY COLLECTION</div>
      <h1>Gaya yang terasa<br /><em>seperti dirimu.</em></h1>
      <p>Pakaian pilihan untuk hari-hari nyata. Temukan bahan nyaman, potongan yang pas, dan inspirasi baru dari komunitas.</p>
      <div className="hero-actions"><Link className="btn-primary" to="/produk">Jelajahi koleksi <Icon type="arrow" size={17} /></Link><Link className="text-link" to="/event">Lihat event <span>→</span></Link></div>
      <div className="social-proof"><div className="avatars"><span>✦</span><span>✳</span><span>♡</span></div><div><b>Temukan gayamu bersama</b><small>Belanja · berbagi · bertemu</small></div></div>
    </div><div className="hero-art"><div className="hero-backdrop" /><div className="hero-sticker">NUSA<br /><span>NEW SEASON</span><br />✳</div><span className="hero-spark spark-one">✳</span><div className="hero-photo"><img src="/images/hero-style.jpg" alt="Inspirasi gaya harian Nusa Wear" /></div><div className="floating-note"><span>✦</span><div><b>Everyday essentials</b><small>Nyaman dipakai, mudah dipadu</small></div></div><div className="hero-caption"><span>NEW ARRIVALS</span><span className="caption-line" /><span>MADE TO MOVE WITH YOU</span></div></div></section>
    <section className="promise-strip"><div><span className="promise-icon">♧</span><span><b>Bahan pilihan</b><small>Nyaman untuk setiap hari</small></span></div><div><span className="promise-icon">✳</span><span><b>Potongan versatile</b><small>Mudah dipadukan</small></span></div><div><span className="promise-icon">♡</span><span><b>Komunitas hangat</b><small>Berbagi inspirasi gaya</small></span></div><div><span className="promise-icon">⌁</span><span><b>Pengiriman nasional</b><small>Belanja dari mana saja</small></span></div></section>
    <section className="section product-section" id="produk"><div className="section-head"><div><p className="eyebrow"><span className="eyebrow-line" /> PILIHAN MINGGU INI</p><h2>Yang paling <em>disukai.</em></h2></div><Link className="all-link" to="/produk">Lihat semua produk <Icon type="arrow" size={16} /></Link></div><div className="category-pills"><Link to="/produk">Semua</Link><Link to="/produk?q=kaos">Kaos</Link><Link to="/produk?q=kemeja">Kemeja</Link><Link to="/produk?q=outerwear">Outerwear</Link><span>✦ Koleksi nyaman sepanjang hari</span></div><div className="product-grid">{state.products.slice(0, 4).map(product => <ProductCard key={product.id} product={product} />)}</div></section>
    <section className="home-community"><div className="home-community-photo"><img src="/images/community-style.jpg" alt="Komunitas berbagi inspirasi gaya" /></div><div className="home-community-copy"><p className="eyebrow">LEBIH DARI SEKADAR PAKAIAN</p><h2>Temukan teman,<br /><em>ceritakan gayamu.</em></h2><p>Ikuti pop-up, workshop, dan obrolan komunitas. Bagikan outfit favoritmu dan temukan inspirasi dari sesama pecinta gaya.</p><div className="hero-actions"><Link className="btn-primary" to="/event">Jelajahi event <Icon type="arrow" size={16} /></Link><Link className="text-link" to="/komunitas">Masuk komunitas <span>→</span></Link></div></div></section>
    <section className="home-event-preview"><div><p className="eyebrow">SAVE THE DATE</p><h2>Agenda seru <em>sebentar lagi.</em></h2><p>Ketemu langsung, saling tukar inspirasi, dan dukung brand lokal bersama Nusa.</p></div><Link className="all-link" to="/event">Lihat semua event <Icon type="arrow" size={16} /></Link><div className="home-event-row">{EVENTS.slice(0, 2).map(item => <article key={item.id}><span>{item.date}</span><b>{item.title}</b><small>{item.location}</small></article>)}</div></section>
    <Newsletter />
  </>;
}
function EventsPage() {
  const { state, setState, user } = useStore();
  const navigate = useNavigate();
  const registrations = state.eventRegistrations || [];

  function toggleRegistration(eventId) {
    if (!user) {
      navigate(`/masuk?next=${encodeURIComponent('/event')}`);
      return;
    }
    setState({
      ...state,
      eventRegistrations: registrations.includes(eventId)
        ? registrations.filter(id => id !== eventId)
        : [...registrations, eventId],
    });
  }

  return <div className="page-container program-page">
    <p className="eyebrow"><span className="eyebrow-line" /> NUSA WEAR HAPPENINGS</p>
    <div className="page-title-row"><div><h1>Ketemu, ngobrol, <em>berbagi gaya.</em></h1><p>Agenda komunitas dan pengalaman seru yang bisa kamu ikuti.</p></div><span className="results-count">{EVENTS.length} agenda</span></div>
    <div className="events-grid">{EVENTS.map(item => {
      const registered = registrations.includes(item.id);
      return <article className="event-card" key={item.id}>
        <div className="event-image"><img src={item.image} alt="" loading="lazy" /><span>{item.type}</span></div>
        <div className="event-copy"><p className="event-date">{item.date} <span>·</span> {item.location}</p><h2>{item.title}</h2><p>{item.description}</p><button className={registered ? 'event-join registered' : 'event-join'} onClick={() => toggleRegistration(item.id)}>{registered ? '✓ Kamu ikut' : 'Ikut event'} <span>→</span></button></div>
      </article>;
    })}</div>
    <div className="event-note"><span>✦</span><p>Agenda ini merupakan contoh. Perbarui tanggal, lokasi, kapasitas, dan tautan pendaftaran sesuai event toko.</p></div>
  </div>;
}
function CommunityPage() {
  const { state, setState, user } = useStore();
  const navigate = useNavigate();
  const posts = state.communityPosts || COMMUNITY_POSTS;
  const likes = state.communityLikes || [];
  const [message, setMessage] = useState('');

  function publish(event) {
    event.preventDefault();
    if (!user) {
      navigate(`/masuk?next=${encodeURIComponent('/komunitas')}`);
      return;
    }
    const form = event.currentTarget;
    const caption = new FormData(form).get('caption').trim();
    if (!caption) return;
    setState({
      ...state,
      communityPosts: [{ id: `look-${Date.now()}`, author: user.name, location: 'Komunitas Nusa', caption, image: '/images/community-style.jpg', likes: 0 }, ...posts],
    });
    form.reset();
    setMessage('Cerita gayamu berhasil dibagikan.');
  }

  function toggleLike(postId) {
    if (!user) {
      navigate(`/masuk?next=${encodeURIComponent('/komunitas')}`);
      return;
    }
    setState({ ...state, communityLikes: likes.includes(postId) ? likes.filter(id => id !== postId) : [...likes, postId] });
  }

  return <div className="page-container community-page">
    <p className="eyebrow"><span className="eyebrow-line" /> NUSA WEAR COMMUNITY</p>
    <div className="community-intro"><div><h1>Gaya kita, <em>cerita kita.</em></h1><p>Tempat berbagi inspirasi outfit, saling kenal, dan merayakan gaya yang terasa paling kamu.</p></div><div className="community-mark">✳<small>WEAR<br />YOUR<br />STORY</small></div></div>
    <div className="community-content">
      <section className="community-feed"><div className="community-feed-head"><div><h2>Cerita dari komunitas</h2><p>Inspirasi nyata dari teman-teman Nusa.</p></div><span>{posts.length} cerita</span></div>
        <div className="community-grid">{posts.map(post => {
          const liked = likes.includes(post.id);
          return <article className="community-card" key={post.id}><img src={post.image} alt={`Inspirasi gaya dari ${post.author}`} loading="lazy" /><div className="community-card-body"><div className="community-author"><span>{post.author[0]}</span><div><b>{post.author}</b><small>{post.location}</small></div></div><p>{post.caption}</p><button className={liked ? 'community-like liked' : 'community-like'} onClick={() => toggleLike(post.id)} aria-label={liked ? 'Batalkan suka' : 'Suka cerita'}>♡ <span>{post.likes + (liked ? 1 : 0)}</span> suka</button></div></article>;
        })}</div>
      </section>
      <aside className="community-share"><span className="share-spark">✳</span><p className="eyebrow">RUANG UNTUKMU</p><h2>Punya gaya yang ingin dibagikan?</h2><p>Ceritakan inspirasi outfit atau momen favoritmu. Bikin komunitas ini tumbuh bersama.</p><form onSubmit={publish}><label htmlFor="community-caption">Ceritamu</label><textarea id="community-caption" name="caption" rows="4" maxLength="220" required placeholder="Hari ini aku pakai..." /><div className="share-footer"><small>Maks. 220 karakter</small><button className="btn-primary">Bagikan cerita</button></div></form>{message && <p className="success-note">✓ {message}</p>}{!user && <small className="share-login">Masuk untuk membagikan cerita dan memberi suka.</small>}</aside>
    </div>
  </div>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><StoreProvider><App /></StoreProvider></BrowserRouter></React.StrictMode>);
