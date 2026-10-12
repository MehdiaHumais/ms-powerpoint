export default function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="bg-red-600 text-white p-4 rounded-2xl shadow-card">
      <p className="font-medium">{message}</p>
    </div>
  );
}