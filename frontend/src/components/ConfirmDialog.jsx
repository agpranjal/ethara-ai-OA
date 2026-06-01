import Modal from './Modal'

export default function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <Modal
      title="Confirm Delete"
      onClose={onCancel}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </>
      }
    >
      <p className="confirm-msg">{message}</p>
    </Modal>
  )
}
