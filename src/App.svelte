<script>

	//  specifics  //
	//import Timelines from './specifics/Timelines.svelte';
	//import TimelineFuture from './specifics/TimelineFuture.svelte';
	//import TimelinePast from './specifics/TimelinePast.svelte';
	//import Meter from './specifics/topMeter.svelte';
	import Footer from './footer.svelte';
	import Header from './header.svelte';


	// PAGES  //
	import Cover from './specifics/Cover.svelte';
	import ExtremeHeatI from './specifics/ExtremeHeatI.svelte';
	//import ExtremeHeatII from './specifics/ExtremeHeatII.svelte';
	import CriticalDecadeI from './specifics/CriticalDecadeI.svelte';
	import CriticalDecadeII from './specifics/CriticalDecadeII.svelte';
	import USA from './specifics/USA.svelte';
	import Brazil from './specifics/Brazil.svelte';
	import Iceland from './specifics/Iceland.svelte';
	import Ghana from './specifics/Ghana.svelte';
	import SaudiArabia from './specifics/SaudiArabia.svelte';
	import India from './specifics/India.svelte';
	import Cambodia from './specifics/Cambodia.svelte';
	import SouthKorea from './specifics/SouthKorea.svelte';
	import EnvironmentalJustice from './specifics/EnvironmentalJustice.svelte';
	import EnvironmentalJusticeII from './specifics/EnvironmentalJusticeII.svelte';
	import ImpactofIndividualAction from './specifics/ImpactofIndividualAction.svelte';
	import CriticalDecadeIII from './specifics/CriticalDecadeIII.svelte';

	let distanceBLines = 'calc((95vh - 1px) / 9 * 1)';
	let marginSides = 'calc(100vw / 16)';

	let scrollToFront = false;
	let Main = true;

	const toggleHide = () => {
		scrollToFront = false;
		Main = true;
	}


	//let pages = [
	//	{ name: 'page1', id: 1, swipes: 0, pageName: 'Cover', rotate: '90deg', pagetitle: 'cover' },
	//	{ name: 'page2', id: 2, swipes: 1, pageName: 'ExtremeHeatI', rotate: '78.75deg', pagetitle: 'Extreme heat:&emsp;I' },
	//	{ name: 'page3', id: 3, swipes: 2, pageName: 'ExtremeHeatII', rotate: '67.5deg', pagetitle: 'Extreme heat:&emsp;II' },
	//	{ name: 'page4', id: 4, swipes: 3, pageName: 'CriticalDecadeI', rotate: '56.25deg', pagetitle: 'The Critical Decade:&emsp;I' },
	//	{ name: 'page5', id: 5, swipes: 4, pageName: 'CriticalDecadeII', rotate: '45deg', pagetitle: 'The Critical Decade:&emsp;II' },
	//	{ name: 'page6', id: 6, swipes: 5, pageName: 'USA', rotate: '33.75deg', pagetitle: 'U.S.A.' },
	//	{ name: 'page7', id: 7, swipes: 6, pageName: 'Brazil', rotate: '22.5deg', pagetitle: 'Brazil' },
	//	{ name: 'page8', id: 8, swipes: 7, pageName: 'Iceland', rotate: '11.25deg', pagetitle: 'Iceland' },
	//	{ name: 'page9', id: 9, swipes: 8, pageName: 'Ghana', rotate: '0deg', pagetitle: 'Ghana' },
	//	{ name: 'page10', id: 10, swipes: 9, pageName: 'SaudiArabia', rotate: '-11.25deg', pagetitle: 'Saudi Arabia' },
	//	{ name: 'page11', id: 11, swipes: 10, pageName: 'India', rotate: '-22.5deg', pagetitle: 'India' },
	//	{ name: 'page12', id: 12, swipes: 11, pageName: 'Cambodia', rotate: '-33.75deg', pagetitle: 'Cambodia' },
	//	{ name: 'page13', id: 13, swipes: 12, pageName: 'SouthKorea', rotate: '-45deg', pagetitle: 'South Korea' },
	//	{ name: 'page14', id: 14, swipes: 13, pageName: 'EnvironmentalJustice', rotate: '-56.25deg', pagetitle: 'Environmental Justice' },
	//	{ name: 'page15', id: 15, swipes: 14, pageName: 'ImpactofIndividualAction', rotate: '-67.5deg', pagetitle: 'Impact of Individual Action' },
	//	{ name: 'page16', id: 16, swipes: 15, pageName: 'CriticalDecadeIII', rotate: '-78.75deg', pagetitle: 'The Critical Decade:&emsp;III, Pledge' },
	//];


</script>




<Header></Header>


<div class="desktopView">
	<div class="please">(Please switch to mobile view)</div>
</div>

{#if scrollToFront}
	<a href="#front" class="scrollToFront" on:click={toggleHide}>
		<div class="text criticalText animone" style="left: {marginSides}; right: {marginSides}; top: calc(({distanceBLines} * 8);">
			(Please lock your phone in portrait mode)
		</div>
		<div class="text criticalText animtwo" style="left: {marginSides}; right: {marginSides}; top: calc(({distanceBLines} * 8);">
			(Click to open)
		</div>
		<div class="pagetitle" style="transform: rotate(90deg);">Now &amp; then<sub>2</sub></div>
		<img class="coverfan" src="imgs/fan.jpg">
	</a>
{/if}

{#if Main}
<div class="newmain">

	<!--{#each pages as page (page.id)}
		<div class="content">
			<{page.pageName} pagetitleText="{page.pagetitle}" rotate="{page.rotate}"></{page.pageName}>
		</div>
	{/each}-->
	<div class="overflowBreaker">
		<div class="content"><CriticalDecadeIII pagetitleText="Critical Decade:&emsp;III, Pledge" rotate="90deg" next="#page2"></CriticalDecadeIII></div>
	</div>
	<div class="overflowBreaker">
		<div class="content"><EnvironmentalJusticeII pagetitleText="Environmental Justice:&emsp;II" rotate="78deg" next="#page3" prev="#page1"></EnvironmentalJusticeII></div>
	</div>
	<div class="overflowBreaker">
		<div class="content country"><USA pagetitleText="The U.S." rotate="66deg" next="#page4" prev="#page2"></USA></div>
	</div>
	<div class="overflowBreaker">
		<div class="content country"><Brazil pagetitleText="Brazil" rotate="54deg" next="#page5" prev="#page3"></Brazil></div>
	</div>
	<div class="overflowBreaker">
		<div class="content"><EnvironmentalJustice pagetitleText="Environmental Justice:&emsp;I" rotate="42deg" next="#page6" prev="#page4"></EnvironmentalJustice></div>
	</div>
	<div class="overflowBreaker">
		<div class="content country"><Iceland pagetitleText="Iceland" rotate="30deg" next="#page7" prev="#page5"></Iceland></div>
	</div>
	<div class="overflowBreaker">
		<div class="content country"><Ghana pagetitleText="Ghana" rotate="18deg" next="#page8" prev="#page6"></Ghana></div>
	</div>
	<div class="overflowBreaker">
		<div class="content country"><SaudiArabia pagetitleText="Saudi Arabia" rotate="6deg" next="#page9" prev="#page7"></SaudiArabia></div>
	</div>
	<div class="overflowBreaker">
		<div class="content"><ImpactofIndividualAction pagetitleText="Impact of Individual Action" rotate="-6deg" next="#page10" prev="#page8"></ImpactofIndividualAction></div>
	</div>
	<div class="overflowBreaker">
		<div class="content country"><India pagetitleText="India" rotate="-18deg" next="#page11" prev="#page9"></India></div>
	</div>
	<div class="overflowBreaker">
		<div class="content"><CriticalDecadeII pagetitleText="The Critical Decade:&emsp;II" rotate="-30deg" next="#page12" prev="#page10"></CriticalDecadeII></div>
	</div>
	<div class="overflowBreaker">
		<div class="content"><CriticalDecadeI pagetitleText="The Critical Decade:&emsp;I" rotate="-42deg" next="#page13" prev="#page11"></CriticalDecadeI></div>
	</div>
	<div class="overflowBreaker">
		<div class="content country"><Cambodia pagetitleText="Cambodia" rotate="-54deg" next="#page14" prev="#page12"></Cambodia></div>
	</div>
	<div class="overflowBreaker">
		<div class="content country"><SouthKorea pagetitleText="South Korea" rotate="-66deg" next="#page15" prev="#page13"></SouthKorea></div>
	</div>
	<div class="overflowBreaker">
		<div class="content"><ExtremeHeatI pagetitleText="Extreme heat" rotate="-78deg" next="#front" prev="#page14"></ExtremeHeatI></div>
	</div>
	<div class="overflowBreaker">
		<div class="content"><Cover pagetitleText="now & then" rotate="-90deg" prev="#page15"></Cover></div>
	</div>



	<!--<div class="dots">
		{#each pages as page (page.id)}
			<a href="#{page.name}" class="dot dot{page.id}"></a>
		{/each}
	</div>-->
</div>


<!--<div class="button">&nbsp;&rarr;</div>-->


<Footer></Footer>
{/if}




<style>

.criticalText {
		color: blue !important;
	}
.animone {
		animation-name: example; 
    	transition-timing-function: ease-in-out;
	    animation-duration: 2s;
	    animation-delay: 0s;
	    animation-iteration-count: 3;
	    opacity: 0;
	}
	@keyframes example {
	  0% {opacity: 0;}
	  20% {opacity: 1;}
	  80% {opacity: 1;}
	  100% {opacity: 0;}
	}
	.animtwo {
		animation-name: exampletwo; 
    	transition-timing-function: ease-in-out;
	    animation-delay: 6s;
	    animation-duration: 2s;
	    animation-iteration-count: infinite;
	    opacity: 0;
	}
	@keyframes exampletwo {
	  0% {opacity: 0;}
	  20% {opacity: 1;}
	  80% {opacity: 1;}
	  100% {opacity: 0;}
	}
.pagetitle {
    font-size: 30px;
    font-family: meadow;
   }
</style>