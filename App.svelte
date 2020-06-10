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
		{ name: 'page1', id: 1, swipes: 0, type: 'notcountry', rotate: '90', pagetitle: 'cover' },
		{ name: 'page2', id: 2, swipes: 1, type: 'notcountry', rotate: '78.75', pagetitle: 'Extreme heat:&emsp;I' },
		{ name: 'page3', id: 3, swipes: 2, type: 'notcountry', rotate: '67.5', pagetitle: 'Extreme heat:&emsp;II' },
		{ name: 'page4', id: 4, swipes: 3, type: 'notcountry', rotate: '56.25', pagetitle: 'The Critical Decade:&emsp;I' },
		{ name: 'page5', id: 5, swipes: 4, type: 'notcountry', rotate: '45', pagetitle: 'The Critical Decade:&emsp;II' },
		{ name: 'page6', id: 6, swipes: 5, type: 'country', rotate: '33.75', pagetitle: 'U.S.A.' },
		{ name: 'page7', id: 7, swipes: 6, type: 'country', rotate: '22.5', pagetitle: 'Brazil' },
		{ name: 'page8', id: 8, swipes: 7, type: 'country', rotate: '11.25', pagetitle: 'Iceland' },
		{ name: 'page9', id: 9, swipes: 8, type: 'country', rotate: '0', pagetitle: 'Ghana' },
		{ name: 'page10', id: 10, swipes: 9, type: 'country', rotate: '-11.25', pagetitle: 'Saudi Arabia' },
		{ name: 'page11', id: 11, swipes: 10, type: 'country', rotate: '-22.5', pagetitle: 'India' },
		{ name: 'page12', id: 12, swipes: 11, type: 'country', rotate: '-33.75', pagetitle: 'Cambodia' },
		{ name: 'page13', id: 13, swipes: 12, type: 'country', rotate: '-45', pagetitle: 'South Korea' },
		{ name: 'page14', id: 14, swipes: 13, type: 'notcountry', rotate: '-56.25', pagetitle: 'Environmental Justice' },
		{ name: 'page15', id: 15, swipes: 14, type: 'notcountry', rotate: '-67.5', pagetitle: 'Impact of Individual Action' },
		{ name: 'page16', id: 16, swipes: 15, type: 'notcountry', rotate: '-78.75', pagetitle: 'The Critical Decade:&emsp;III, Pledge' },
	];


</script>

<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0">


<Header></Header>



<div class="newmain">
	<a href="#page1" class="content page1 notcountry">
		<Cover pagetitleText="Cover" rotate="90deg"></Cover>
	</a>
	<div class="content page2 notcountry">
		<ExtremeHeatI pagetitleText="Extreme heat:&emsp;I" rotate="78.75deg"></ExtremeHeatI>
	</div>
	<div class="content page3 notcountry">
		<ExtremeHeatII pagetitleText="Extreme heat:&emsp;II" rotate="67.5deg"></ExtremeHeatII>
	</div>
	<div class="content page4 notcountry">
		<CriticalDecadeI pagetitleText="The Critical Decade:&emsp;I" rotate="56.25deg"></CriticalDecadeI>
	</div>
	<div class="content page5 notcountry">
		<CriticalDecadeII pagetitleText="The Critical Decade:&emsp;II" rotate="45deg"></CriticalDecadeII>
	</div>
	<div class="content page6 country">
		<USA pagetitleText="U.S.A." rotate="33.75deg"></USA>
	</div>
	<div class="content page6 country">
		<Brazil pagetitleText="Brazil" rotate="22.5deg"></Brazil>
	</div>
	<div class="content page7 country">
		<Iceland pagetitleText="Iceland" rotate="11.25deg"></Iceland>
	</div>
	<div class="content page8 country">
		<Ghana pagetitleText="Ghana" rotate="0deg"></Ghana>
	</div>
	<div class="content page10 country">
		<SaudiArabia pagetitleText="SaudiArabia" rotate="-11.25deg"></SaudiArabia>
	</div>
	<div class="content page11 country">
		<India pagetitleText="India" rotate="-22.5deg"></India>
	</div>
	<div class="content page12 country">
		<Cambodia pagetitleText="Cambodia" rotate="-33.75deg"></Cambodia>
	</div>
	<div class="content page13 country">
		<SouthKorea pagetitleText="SouthKorea" rotate="-45deg"></SouthKorea>
	</div>
	<div class="content page14 notcountry">
		<EnvironmentalJustice pagetitleText="Environmental Justice" rotate="-56.25deg"></EnvironmentalJustice>
	</div>
	<div class="content page15 notcountry">
		<ImpactofIndividualAction pagetitleText="Impact of Individual Action" rotate="-67.5deg"></ImpactofIndividualAction>
	</div>
	<div class="content page16 notcountry">
		<CriticalDecadeIII pagetitleText="Critical Decade:&emsp;III, Pledge" rotate="-78.75deg"></CriticalDecadeIII>
	</div>


	<div class="dots">
		{#each pages as page (page.id)}
			<a href="#{page.name}" class="dot dot{page.id}">
				<!--<img style="width: 95%; margin-left: 2.5%; margin-top: 4%;" src="imgs/{page.name}.png">-->
			</a>
		{/each}
	</div>
</div>





<Footer></Footer>





<style>





.dots {
	position: fixed;
	bottom: 0vh;
	height: 5vh;
	left: 0px;
	width: 100vw;
	border-left: 1px solid #444;
	z-index: 99999;
}
.dot {
	width: calc((100vw / 16) - 1px);
	border-right: 1px solid #444;
	height: calc(5vh - 2px);
	margin-top: 1px;
	/*margin: 0 0px;*/
	display: inline-block;
}
.dot:hover {
	background-color: rgba(70,70,70);
}
</style>
