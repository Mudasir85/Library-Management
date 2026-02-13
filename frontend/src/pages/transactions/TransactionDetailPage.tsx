import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionService } from '@/services/transaction.service';
import { Transaction } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function TransactionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!id) {
        toast.error('Transaction ID is missing.');
        navigate('/transactions');
        return;
      }

      setIsLoading(true);
      try {
        const response = await transactionService.getById(id);
        setTransaction(response.data);
      } catch {
        toast.error('Failed to load transaction details');
        navigate('/transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [id, navigate]);

  if (isLoading) {
    return <LoadingSpinner message="Loading transaction details..." />;
  }

  if (!transaction) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-600">Transaction not found.</p>
        <Link to="/transactions" className="mt-3 inline-block text-primary-600 hover:underline">
          Back to Transactions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={() => navigate('/transactions')}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Transactions
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
          <p className="mt-1 text-sm text-gray-500">Review issue, return, and fine information.</p>
        </div>
        {transaction.status === 'issued' && (
          <button
            onClick={() => navigate('/transactions/return')}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            Return Book
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
            Book Information
          </h2>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="text-lg font-semibold text-gray-900">{transaction.book?.title ?? 'Unknown'}</p>
            <p className="text-sm text-gray-600">by {transaction.book?.author ?? 'Unknown'}</p>
            {transaction.book?.isbn && (
              <p className="mt-1 text-xs text-gray-400">ISBN: {transaction.book.isbn}</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
            Member Information
          </h2>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="font-medium text-gray-900">{transaction.member?.fullName ?? 'Unknown'}</p>
            <p className="text-sm text-gray-600">{transaction.member?.email ?? 'No email'}</p>
            {transaction.member?.memberType && (
              <div className="mt-2">
                <StatusBadge status={transaction.member.memberType} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Transaction Details
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-100 p-3">
            <p className="text-xs text-gray-400">Issue Date</p>
            <p className="font-medium text-gray-900">
              {format(new Date(transaction.issueDate), 'MMMM dd, yyyy')}
            </p>
          </div>
          <div className="rounded-lg border border-gray-100 p-3">
            <p className="text-xs text-gray-400">Due Date</p>
            <p className="font-medium text-gray-900">
              {format(new Date(transaction.dueDate), 'MMMM dd, yyyy')}
            </p>
          </div>
          <div className="rounded-lg border border-gray-100 p-3">
            <p className="text-xs text-gray-400">Return Date</p>
            <p className="font-medium text-gray-900">
              {transaction.returnDate
                ? format(new Date(transaction.returnDate), 'MMMM dd, yyyy')
                : 'Not returned'}
            </p>
          </div>
          <div className="rounded-lg border border-gray-100 p-3">
            <p className="text-xs text-gray-400">Status</p>
            <div className="mt-0.5">
              <StatusBadge status={transaction.status} size="md" />
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 p-3">
            <p className="text-xs text-gray-400">Renewals</p>
            <p className="font-medium text-gray-900">{transaction.renewalCount}</p>
          </div>
          <div className="rounded-lg border border-gray-100 p-3">
            <p className="text-xs text-gray-400">Fine</p>
            {transaction.fineAmount > 0 ? (
              <p className="font-medium text-red-600">
                ${transaction.fineAmount.toFixed(2)}{' '}
                {transaction.finePaid && <span className="text-xs text-green-600">(Paid)</span>}
              </p>
            ) : (
              <p className="font-medium text-gray-400">None</p>
            )}
          </div>
        </div>
      </div>

      {transaction.issuedBy && (
        <div className="text-xs text-gray-400">
          Issued by: {transaction.issuedBy.fullName}
          {transaction.returnedTo && <> | Returned to: {transaction.returnedTo.fullName}</>}
        </div>
      )}
    </div>
  );
}
