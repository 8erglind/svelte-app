<script>
	export let pagetitleText;
	export let rotate;
	export let next;
	export let prev;


	let distanceBLines = 'calc((100% - 1px) / 9 * 1)';
	let marginSides = 'calc(100vw / 16)';



	let firstSetup = true;
	let secondSetupA = false;
	let secondSetupB = false;
	let thirdSetup = false;


	const togglefirstSetup = () => {
		firstSetup = true;
		secondSetupA = false;
		secondSetupB = false;
		thirdSetup = false;

	}

	const togglesecondASetup = () => {
		firstSetup = false;
		secondSetupA = true;
		secondSetupB = false;
		thirdSetup = false;
	}

	const togglesecondBSetup = () => {
		firstSetup = false;
		secondSetupA = true;
		secondSetupB = true;
		thirdSetup = true;
	}


</script>






<!--    BUTTONS    -->


{#if firstSetup}
	<div class="buttonNext" on:click={togglesecondASetup}></div>
	<a class="buttonPrev" href="{next}"></a>
{/if}
{#if secondSetupA}
	<div class="buttonNext" on:click={togglesecondBSetup}></div>
	<div class="buttonPrev" on:click={togglefirstSetup}></div>
{/if}
{#if secondSetupB}
	<a class="buttonNext" href="{prev}"></a>
	<div class="buttonPrev" on:click={togglesecondASetup}></div>
{/if}








<!--    TEXT    -->

<div class="pagetitle" style="transform: rotate({rotate});">
 	{pagetitleText}
 	<div class="text">At the this is written, protests are happening all over the U.S. (and the world), calling for an end to racial injustice and defunding/abolishion of the police.</div>
</div>







<!--    CONTENT    -->

{#if firstSetup}
	<div class="horizontalLine left" style="width: 100%; top: calc(({distanceBLines} * 8) - 1px); border-top: 1px solid blue;"></div>
	<!--<div class="text criticalText" style="left: {marginSides}; right: {marginSides}; top: calc(({distanceBLines} * 8);">This is a Critical Decade.</div>-->
{/if}
{#if secondSetupA}
	<div class="fullpage" style="top: {distanceBLines};"></div>
{/if}
{#if secondSetupB}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200 365 900 365 600 365 300 365 0 305 0 305 300 340 600 340 900 353 900 353 1200 365 1200"/>
	</svg>
{/if}

<!--<div class="backgroundBox">
		<svg class="graph" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
			<polygon class="cls-1" points="365 1200 365 900 365 600 365 300 365 0 305 0 305 300 340 600 340 900 353 900 353 1200 365 1200"/>
		</svg>
		{#if secondSetup}
			<div class="fullpage"></div>
		{/if}
</div>-->







<!--    DOTS    -->



<div class="activedot activedot15"></div>
<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate} + 11.25deg));"></div>
</div>







<style>

.fullpage {
	position: absolute;
	z-index: -2;
	bottom: 0%;
	left: 0%;
	width: 100%;

	background-image: url('https://static.independent.co.uk/s3fs-public/thumbnails/image/2020/06/07/13/aerial-protests-0.jpg');
	background-size: cover;
	background-position: center center;
}

/*.pagetitle {
	-webkit-text-fill-color: white;
	z-index: 9;
}*/


</style>