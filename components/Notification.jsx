import { useEffect, useState, useRef } from 'react'
import useTerrainStore from '../store/terrainStore'

// Simple check icon component
const CheckIcon = ({ className }) => (
	<svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
		<polyline points='20 6 9 17 4 12' />
	</svg>
)

// Notification component
const Notification = () => {
	const notification = useTerrainStore((state) => state.notification)
	const hideNotification = useTerrainStore((state) => state.hideNotification)

	const [inputValue, setInputValue] = useState('')
	const inputRef = useRef(null)

	// Reset input value when notification changes
	useEffect(() => {
		if (notification?.input) {
			setInputValue(notification.inputValue || '')
			setTimeout(() => inputRef.current?.focus(), 100)
		}
	}, [notification])

	if (!notification) return null

	// Confirm the notification
	const handleConfirm = () => {
		const currentId = notification.id
		if (notification.onConfirm) {
			notification.onConfirm({
				isConfirmed: true,
				value: inputValue,
				isDismissed: false,
			})
		}

		if (useTerrainStore.getState().notification?.id === currentId) {
			hideNotification()
		}
	}

	// Cancel the notification
	const handleCancel = () => {
		if (notification.onCancel) {
			notification.onCancel({
				isConfirmed: false,
				isDismissed: true,
			})
		}
		hideNotification()
	}

	// Keyboard shortcuts
	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			handleConfirm()
		} else if (e.key === 'Escape') {
			handleCancel()
		}
	}

	return (
		<div className='fixed inset-0 flex items-center justify-center bg-black/20 z-50' onClick={handleCancel}>
			<div className='animate-fade-scale-in bg-black/80 rounded-2xl space-y-6 p-8 max-w-md w-full' onClick={(e) => e.stopPropagation()}>
				<div className={`flex items-center gap-4 ${notification.centered ? 'flex-col justify-center text-center gap-6' : ''}`}>
					{notification.type === 'success' && (
						<div className='bg-green-500/20 p-4 rounded-full animate-pop-in'>
							<CheckIcon className='w-12 h-12 text-green-500' />
						</div>
					)}
					{notification.icon && notification.type !== 'success' && (
						<notification.icon className={`text-white/90 ${notification.centered ? 'w-12 h-12 animate-pop-in' : 'w-6 h-6'}`} />
					)}
					{notification.title && <h2 className='text-2xl text-white font-bold'>{notification.title}</h2>}
				</div>

				{notification.text && <p className={`text-gray-300 ${notification.centered ? 'text-center text-lg' : ''}`}>{notification.text}</p>}

				{notification.html && <div dangerouslySetInnerHTML={{ __html: notification.html }} />}

				{notification.input && (
					<input
						ref={inputRef}
						type='text'
						className='w-full'
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={notification.inputPlaceholder || ''}
					/>
				)}

				<div className={`flex gap-4 ${notification.centered ? 'justify-center w-full' : 'justify-end'}`}>
					{notification.showCancelButton && (
						<button className='secondary' onClick={handleCancel}>
							{notification.cancelButtonText || 'Cancel'}
						</button>
					)}

					<button
						className={
							notification.type === 'success'
								? 'bg-green-600 hover:bg-green-500 w-full max-w-xs justify-center py-3 text-base shadow-lg shadow-green-900/20'
								: 'primary'
						}
						onClick={handleConfirm}
					>
						{notification.confirmButtonText || 'OK'}
					</button>
				</div>
			</div>
		</div>
	)
}

export default Notification
