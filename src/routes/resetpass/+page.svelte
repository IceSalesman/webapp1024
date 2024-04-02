<script lang='ts'>
    import { authHandlers } from '../../stores/authStore';
    let email: any;

</script>






<body class="bg-gray-800 text-gray-100">
	<div class="flex justify-center items-center h-screen">
		<div class="w-full max-w-md p-8 space-y-3 rounded-xl bg-gray-900 text-gray-100">
			<h1 class="text-2xl font-bold text-center">Paroles attiestāšana</h1>
				<form class="space-y-6">
					<div>
						<input bind:value={email} type="email" id="email" placeholder="E-pasts" class="w-full p-2 border rounded bg-gray-800 border-gray-700" />
					</div>
					
					
					<button 
                        on:click={() => {

                            authHandlers.resetPassword(email)
                            alert('Paroles atiestāšanas e-pasts nosūtīts')
                            
                        }}
                        on:keydown={() => {}} 
                        class="block w-full p-3 text-center rounded-sm text-gray-900 bg-violet-300" >
                        Nosūtīt
                    </button>
				</form>
		
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						on:click={() => {
							window.location.href = '/';
						}}
						on:keydown={() => {}} 
						class="flex justify-center text-xs text-gray-400 cursor-pointer hover:underline"
					>
						Atpakaļ
					</div>
				
		</div>
	</div>
</body>
