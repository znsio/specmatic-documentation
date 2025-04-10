__( 'Global CSS Class', 'elementor' );
__( 'Global CSS Classes', 'elementor' );
__( 'CSS Class manager' ) }
						</PanelHeaderTitle>
						<CloseButton sx={ { marginLeft: 'auto' } } />
					</Stack>
				</PanelHeader>
				<PanelBody px={ 2 }>
					<GlobalClassesList />
				</PanelBody>
			</Panel>
		</ErrorBoundary>
	);
}

const CloseButton = ( props: IconButtonProps ) => {
	const { close } = usePanelActions();

	return (
		<IconButton size="small" color="secondary" onClick={ close } { ...props }>
			<XIcon fontSize="small" />
		</IconButton>
	);
};

const ErrorBoundaryFallback = () => (
	<Box role="alert" sx={ { minHeight: '100%', p: 2 } }>
		<Alert severity="error" sx={ { mb: 2, maxWidth: 400, textAlign: 'center' } }>
			<strong>{ __( 'Something went wrong', 'elementor' );