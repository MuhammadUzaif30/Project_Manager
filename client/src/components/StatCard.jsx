const StatCard = ({ label, value }) => (
  <div style={{ border: '1px solid #ddd', borderRadius: 6, padding: 16, textAlign: 'center' }}>
    <div style={{ fontSize: 28, fontWeight: 'bold' }}>{value}</div>
    <div style={{ fontSize: 13, color: '#666' }}>{label}</div>
  </div>
);

export default StatCard;