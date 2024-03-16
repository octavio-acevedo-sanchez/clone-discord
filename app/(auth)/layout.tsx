const LayoutAuth = ({
	children
}: {
	children: React.ReactNode;
}): React.ReactNode => {
	return (
		<div className='h-full flex items-center justify-center'>{children}</div>
	);
};

export default LayoutAuth;
