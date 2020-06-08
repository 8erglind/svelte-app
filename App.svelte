<script>

	//  specifics  //
	import Timelines from './specifics/Timelines.svelte';
	import TimelineFuture from './specifics/TimelineFuture.svelte';
	import TimelinePast from './specifics/TimelinePast.svelte';
	import Meter from './specifics/topMeter.svelte';
	import Footer from './footer.svelte';

	
	//  take out and delete file once all pages are in  //
	import Pagetitle from './specifics/pagetitle.svelte';


	// PAGES  //
	import Cover from './specifics/Cover.svelte';
	import CriticalDecadeI from './specifics/CriticalDecadeI.svelte';

	// hvað gerist ef ég breyti þessu hér?   3tilraun

	import Swipeable from './swipable.svelte'
	import { onMount } from 'svelte'

	let initializing = true
	let loginProgress, loginSwipeable
	onMount(function() {
		setTimeout(() => initializing = false, 100)
	})

	
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






<div id="wrapper">
	<Swipeable numStates="16" let:current let:progress={introProgress}>
	  <div class="slides fullpage" style="transform: scale({0.7 + 0.3 * (1 - $loginProgress)})">

			<main class:current={current == 0}>
				<div class="content page1" style="right: {100 * (introProgress - 0)}%;">
					<Cover pagetitleText="Cover" rotate="90deg"></Cover>
				</div>
			</main>
			<main class:current={current == 1}>
				<div class="content page2" style="right: {100 * (introProgress - 1)}%;">
					<Pagetitle pagetitleText="Extreme heat:&emsp;I" rotate="78.75deg"></Pagetitle>
				</div>
			</main>
			<main class:current={current == 2}>
				<div class="content page3" style="right: {100 * (introProgress - 2)}%;">
					<Pagetitle pagetitleText="Extreme heat:&emsp;II" rotate="67.5deg"></Pagetitle>
				</div>
			</main>
			<main class:current={current == 3}>
				<div class="content page4" style="right: {100 * (introProgress - 3)}%;">
					
					<CriticalDecadeI pagetitleText="The Critical Decade:&emsp;I" rotate="56.25deg"></CriticalDecadeI>
				</div>				
			</main>
			<main class:current={current == 4}>
				<div class="content page4" style="right: {100 * (introProgress - 4)}%;">
					<Pagetitle pagetitleText="The Critical Decade:&emsp;II" rotate="45deg"></Pagetitle>
					<Meter></Meter>
				</div>
			</main>
			<main class:current={current == 5}>
				<div class="content page5" style="right: {100 * (introProgress - 5)}%;">
					<Pagetitle pagetitleText="U.S.A." rotate="33.75deg"></Pagetitle>
					<Timelines></Timelines>
				</div>
			</main>
			<main class:current={current == 6}>
				<div class="content page6" style="right: {100 * (introProgress - 6)}%;">
					<Pagetitle pagetitleText="Brazil" rotate="22.5deg"></Pagetitle>
					<Timelines></Timelines>
				</div>
			</main>
			<main class:current={current == 7}>
				<div class="content page7" style="right: {100 * (introProgress - 7)}%;">
					<Pagetitle pagetitleText="Iceland" rotate="11.25deg"></Pagetitle>
					<Timelines></Timelines>
				</div>
			</main>
			<main class:current={current == 8}>
				<div class="content page8" style="right: {100 * (introProgress - 8)}%;">
					<Pagetitle pagetitleText="Ghana" rotate="0deg"></Pagetitle>
					<Timelines></Timelines>
				</div>
			</main>
			<main class:current={current == 9}>
				<div class="content page9" style="right: {100 * (introProgress - 9)}%;">
					<Pagetitle pagetitleText="Saudi Arabia" rotate="-11.25deg"></Pagetitle>
					<Timelines></Timelines>
				</div>
			</main>
			<main class:current={current == 10}>
				<div class="content page10" style="right: {100 * (introProgress - 10)}%;">
					<Pagetitle pagetitleText="India" rotate="-22.5deg"></Pagetitle>
					<Timelines></Timelines>
				</div>
			</main>
			<main class:current={current == 11}>
				<div class="content page11" style="right: {100 * (introProgress - 11)}%;">
					<Pagetitle pagetitleText="Cambodia" rotate="-33.75deg"></Pagetitle>
					<Timelines></Timelines>
				</div>
			</main>
			<main class:current={current == 12}>
				<div class="content page12" style="right: {100 * (introProgress - 12)}%;">
					<Pagetitle pagetitleText="South Korea" rotate="-45deg"></Pagetitle>
					<Timelines></Timelines>
				</div>
			</main>
			<main class:current={current == 13}>
				<div class="content page13" style="right: {100 * (introProgress - 13)}%;">
					<Pagetitle pagetitleText="Environmental Justice" rotate="-56.25deg"></Pagetitle>
				</div>
			</main>
			<main class:current={current == 14}>
				<div class="content page14" style="right: {100 * (introProgress - 14)}%;">
					<Pagetitle pagetitleText="Impact of Individual Action" rotate="-67.5deg"></Pagetitle>
				</div>
			</main>
			<main class:current={current == 15}>
				<div class="content page15" style="right: {100 * (introProgress - 15)}%;">
					<Pagetitle pagetitleText="Critical Decade:&emsp;III, Pledge" rotate="-78.75deg"></Pagetitle>
				</div>
			</main>


			
			
			<div class="dots">
				<div class="dot active" style="left: calc({introProgress * 6.25}vw)"></div>
				{#each pages as page (page.id)}
					<div class="dot">
						<img style="width: 95%; margin-left: 2.5%; margin-top: 4%;" src="imgs/{page.name}.png">
					</div>
				{/each}
			</div>
		</div>
	</Swipeable>
</div>


<Footer></Footer>





<style>


.content {
	position: relative;
	background-color: rgba(250,250,250,1);
}
.page1 {
	position: sticky;
	left: 0vw;
}
.page2 {
	/*position: sticky;
	left: calc(80vw + 1vw);
	left: 80vw;*/
}
.page3 {
	/*position: sticky;
	left: calc(80vw * 3);
	left: auto;*/
}



.dots {
	position: absolute;
	bottom: 0vh;
	height: 5vh;
	left: 0px;
	width: 100vw;
	border-left: 1px solid #444;
}
.dot {
	width: calc((100vw / 16) - 1px);
	border-right: 1px solid #444;
	height: 5vh;
	/*margin: 0 0px;*/
	display: inline-block;
}
.dot.active {
	position: absolute;
	background-color: rgb(70,70,70);
	width: calc(100vw / 16);
	z-index: -1;
}
</style>