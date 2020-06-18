<script>

	//  specifics  //
	import Timelines from './specifics/Timelines.svelte';
	import TimelineFuture from './specifics/TimelineFuture.svelte';
	import TimelinePast from './specifics/TimelinePast.svelte';
	import Meter from './specifics/topMeter.svelte';
	import Footer from './footer.svelte';
	import Header from './header.svelte';


	// PAGES  //
	import Cover from './specifics/Cover.svelte';
	import ExtremeHeatI from './specifics/ExtremeHeatI.svelte';
	import ExtremeHeatII from './specifics/ExtremeHeatII.svelte';
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
	import ImpactofIndividualAction from './specifics/ImpactofIndividualAction.svelte';
	import CriticalDecadeIII from './specifics/CriticalDecadeIII.svelte';

	




	let pages = [
		{ name: 'page1', id: 1, swipes: 0, pageName: 'Cover', rotate: '90deg', pagetitle: 'cover' },
		{ name: 'page2', id: 2, swipes: 1, pageName: 'ExtremeHeatI', rotate: '78.75deg', pagetitle: 'Extreme heat:&emsp;I' },
		{ name: 'page3', id: 3, swipes: 2, pageName: 'ExtremeHeatII', rotate: '67.5deg', pagetitle: 'Extreme heat:&emsp;II' },
		{ name: 'page4', id: 4, swipes: 3, pageName: 'CriticalDecadeI', rotate: '56.25deg', pagetitle: 'The Critical Decade:&emsp;I' },
		{ name: 'page5', id: 5, swipes: 4, pageName: 'CriticalDecadeII', rotate: '45deg', pagetitle: 'The Critical Decade:&emsp;II' },
		{ name: 'page6', id: 6, swipes: 5, pageName: 'USA', rotate: '33.75deg', pagetitle: 'U.S.A.' },
		{ name: 'page7', id: 7, swipes: 6, pageName: 'Brazil', rotate: '22.5deg', pagetitle: 'Brazil' },
		{ name: 'page8', id: 8, swipes: 7, pageName: 'Iceland', rotate: '11.25deg', pagetitle: 'Iceland' },
		{ name: 'page9', id: 9, swipes: 8, pageName: 'Ghana', rotate: '0deg', pagetitle: 'Ghana' },
		{ name: 'page10', id: 10, swipes: 9, pageName: 'SaudiArabia', rotate: '-11.25deg', pagetitle: 'Saudi Arabia' },
		{ name: 'page11', id: 11, swipes: 10, pageName: 'India', rotate: '-22.5deg', pagetitle: 'India' },
		{ name: 'page12', id: 12, swipes: 11, pageName: 'Cambodia', rotate: '-33.75deg', pagetitle: 'Cambodia' },
		{ name: 'page13', id: 13, swipes: 12, pageName: 'SouthKorea', rotate: '-45deg', pagetitle: 'South Korea' },
		{ name: 'page14', id: 14, swipes: 13, pageName: 'EnvironmentalJustice', rotate: '-56.25deg', pagetitle: 'Environmental Justice' },
		{ name: 'page15', id: 15, swipes: 14, pageName: 'ImpactofIndividualAction', rotate: '-67.5deg', pagetitle: 'Impact of Individual Action' },
		{ name: 'page16', id: 16, swipes: 15, pageName: 'CriticalDecadeIII', rotate: '-78.75deg', pagetitle: 'The Critical Decade:&emsp;III, Pledge' },
	];


</script>




<Header></Header>



<div class="newmain">

	<!--{#each pages as page (page.id)}
		<div class="content">
			<{page.pageName} pagetitleText="{page.pagetitle}" rotate="{page.rotate}"></{page.pageName}>
		</div>
	{/each}-->

	<div class="content"><CriticalDecadeIII pagetitleText="Critical Decade:&emsp;III, Pledge" rotate="90deg" next="#page2"></CriticalDecadeIII></div>
	<div class="content country"><USA pagetitleText="The U.S." rotate="78.75deg" next="#page3" prev="#page1"></USA></div>
	<div class="content country"><Brazil pagetitleText="Brazil" rotate="67.5deg" next="#page4" prev="#page2"></Brazil></div>
	<div class="content"><EnvironmentalJustice pagetitleText="Environmental Justice" rotate="56.25deg" next="#page5" prev="#page3"></EnvironmentalJustice></div>
	<div class="content country"><Iceland pagetitleText="Iceland" rotate="45deg" next="#page6" prev="#page4"></Iceland></div>
	<div class="content country"><Ghana pagetitleText="Ghana" rotate="33.75deg" next="#page7" prev="#page5"></Ghana></div>
	<div class="content country"><SaudiArabia pagetitleText="Saudi Arabia" rotate="22.5deg" next="#page8" prev="#page6"></SaudiArabia></div>
	<div class="content"><ImpactofIndividualAction pagetitleText="Impact of Individual Action" rotate="11.25deg" next="#page9" prev="#page7"></ImpactofIndividualAction></div>
	<div class="content country"><India pagetitleText="India" rotate="0deg" next="#page10" prev="#page8"></India></div>
	<div class="content"><CriticalDecadeII pagetitleText="The Critical Decade:&emsp;II" rotate="-11.25deg" next="#page11" prev="#page9"></CriticalDecadeII></div>
	<div class="content"><CriticalDecadeI pagetitleText="The Critical Decade:&emsp;I" rotate="-22.5deg" next="#page12" prev="#page10"></CriticalDecadeI></div>
	<div class="content country"><Cambodia pagetitleText="Cambodia" rotate="-33.75deg" next="#page13" prev="#page11"></Cambodia></div>
	<div class="content country"><SouthKorea pagetitleText="South Korea" rotate="-45deg" next="#page14" prev="#page12"></SouthKorea></div>
	<div class="content"><ExtremeHeatII pagetitleText="Extreme heat:&emsp;II" rotate="-56.25deg" next="#page15" prev="#page13"></ExtremeHeatII></div>
	<div class="content"><ExtremeHeatI pagetitleText="Extreme heat:&emsp;I" rotate="-67.5deg" next="#page16" prev="#page14"></ExtremeHeatI></div>
	<div class="content"><Cover pagetitleText="now & then" rotate="-78.75deg" prev="#page15"></Cover></div>



	<!--<div class="dots">
		{#each pages as page (page.id)}
			<a href="#{page.name}" class="dot dot{page.id}"></a>
		{/each}
	</div>-->
</div>


<!--<div class="button">&nbsp;&rarr;</div>-->


<Footer></Footer>





<style>

/*.button {
	position: fixed;
	bottom: calc(5vh + 10px);
	right: 10px;
	width: 5vh;
	height: 5vh;
	border-radius: 50%;
	border: 1px solid purple;
	font-size: 22px;
    font-family: meadow;
    color: purple;
}*/



.dots {
	position: fixed;
	bottom: 0%;
	height: 5%;
	left: 0px;
	width: 100vw;
	/*border-left: 1px solid #444;*/
	z-index: 99999;
}
.dot {
	width: calc((100vw / 16) - 1px);
	/*border-right: 1px solid #444;*/
	height: calc(100% - 2px);
	margin-top: 1px;
	/*margin: 0 0px;*/
	display: inline-block;

}
</style>