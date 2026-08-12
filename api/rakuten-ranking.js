export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.status(410).json({
    ok: false,
    error: 'This relay has been disabled. Ranking collection now uses the authenticated fixed-IP proxy directly.'
  });
}
