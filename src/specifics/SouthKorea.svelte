<script>
	export let pagetitleText;
	export let rotate;
	export let next;
	export let prev;

	let distanceBLines = 'calc((100% - 1px) / 9 * 1)';
	let marginSides = 'calc(100vw / 16)';

	//import TimelinesEmpty from './TimelineEmpty.svelte';

	let firstSetup = true;
	let secondSetup = false;
	let secondPhoto = false;
	let thirdSetup = false;
	let thirdPhoto = false;
	let fourthSetup = false;
	let tempMeter = false;
	let fifthSetup = false;
	let hotDays = false;
	let sixthSetup = false;

	let twentyfourty = false;


	const togglefirstSetup = () => {
		firstSetup = true;
		secondSetup = false;
		secondPhoto = false;
		thirdSetup = false;
		thirdPhoto = false;
		fourthSetup = false;
		tempMeter = false;
		fifthSetup = false;
		hotDays = false;
		sixthSetup = false;
		twentyfourty = false;
	}

	const togglesecondSetup = () => {
		firstSetup = false;
		secondSetup = true;
		secondPhoto = true;
		thirdSetup = false;
		thirdPhoto = false;
		fourthSetup = false;
		tempMeter = false;
		fifthSetup = false;
		hotDays = false;
		sixthSetup = false;
		twentyfourty = false;
	}

	const togglethirdSetup = () => {
		firstSetup = false;
		secondSetup = false;
		secondPhoto = true;
		thirdSetup = true;
		thirdPhoto = true;
		fourthSetup = false;
		tempMeter = false;
		fifthSetup = false;
		hotDays = false;
		sixthSetup = false;
		twentyfourty = false;
	}

	const togglefourthSetup = () => {
		firstSetup = false;
		secondSetup = false;
		secondPhoto = true;
		thirdSetup = false;
		thirdPhoto = true;
		fourthSetup = true;
		tempMeter = true;
		fifthSetup = false;
		hotDays = false;
		sixthSetup = false;
		twentyfourty = true;
	}

	const togglefifthSetup = () => {
		firstSetup = false;
		secondSetup = false;
		secondPhoto = true;
		thirdSetup = false;
		thirdPhoto = true;
		fourthSetup = false;
		tempMeter = true;
		fifthSetup = true;
		hotDays = true;
		sixthSetup = false;
		twentyfourty = true;
	}

	const togglesixthSetup = () => {
		firstSetup = false;
		secondSetup = false;
		secondPhoto = true;
		thirdSetup = false;
		thirdPhoto = true;
		fourthSetup = false;
		tempMeter = true;
		fifthSetup = false;
		hotDays = true;
		sixthSetup = true;
		twentyfourty = false;
	}


</script>




<!--    BUTTONS    -->

{#if firstSetup}
	<div class="buttonNext" on:click={togglesecondSetup}></div>
	<a class="buttonPrev" href="{next}"></a>
{/if}
{#if secondSetup}
	<div class="buttonNext" on:click={togglethirdSetup}></div>
	<div class="buttonPrev" on:click={togglefirstSetup}></div>
{/if}
{#if thirdSetup}
	<div class="buttonNext" on:click={togglefourthSetup}></div>
	<div class="buttonPrev" on:click={togglesecondSetup}></div>
{/if}
{#if fourthSetup}
	<div class="buttonNext" on:click={togglefifthSetup}></div>
	<div class="buttonPrev" on:click={togglethirdSetup}></div>
{/if}
{#if fifthSetup}
	<div class="buttonNext" on:click={togglesixthSetup}></div>
	<div class="buttonPrev" on:click={togglefourthSetup}></div>
{/if}
{#if sixthSetup}
	<a class="buttonNext" href="{prev}"></a>
	<div class="buttonPrev" on:click={togglefifthSetup}></div>
{/if}



<!--<div class="prePics" style="top: calc({distanceBLines} * 0); left: calc({marginSides} + 5px);">
	<img class="smallPic" src="https://i.pinimg.com/564x/e2/95/98/e29598f213c862f21bf9e9b02d1a2587.jpg">
</div>-->



<div class="pagetitle" style="transform: rotate({rotate});">{pagetitleText}</div>

{#if firstSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
	 	Heat is nothing new, and people have created multiple remedies to endure&nbsp;it.
	</div>
{/if}
{#if secondSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
	 	A Bamboo Wife is a cylinder woven out of bamboo that can be cuddled in warm weather in order to better allow air to access the surface of your body. This object is known throughout South-East Asia and in South-Korea is named <span style="font-family: arita_semibold;">죽부인</span> (Jukbuin).
	</div>
{/if}
{#if secondPhoto}<img style="position: absolute; width: 45%; left: 7%; top: 4%;" src="https://limdongcheol.files.wordpress.com/2010/08/100159_0-87331700.jpg">{/if}

{#if thirdSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
	 	Another heat related tradition is connected to the phrase <span style="font-family: arita_semibold;">이열치열</span> (Iyeolchiyeol), which translates to "fight fire with fire" meaning to control body heat with heat. This is done by eating a warm chicken soup called <span style="font-family: arita_semibold;">호수 삼계탕</span> (Samgyetang) or visiting a hot&nbsp;sauna.
	</div>
{/if}
{#if thirdPhoto}
	<img style="position: absolute; width: 45%; right: 0%; bottom: 2%;" src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Samgyetang.jpg/260px-Samgyetang.jpg"><!--FREE TO SHARE PIC-->
{/if}
{#if fourthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
	 	South Korea is conveniently located when it comes to future extreme heat increase. Following "business as usual", extremely hot days will not increase at all in South Korea for the next 20&nbsp;years...
	</div>
	<div class="text years right line0 now">2020</div>
	<div class="line right line0"></div>
	<div class="horizontalLine full right line0"></div>
{/if}
{#if twentyfourty}
	<div class="text years right line20">2040</div>
	<div class="line right line20"></div>
	<div class="horizontalLine full right line20"></div>
{/if}
{#if fifthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
	 	... hot days will increase by only two per year in the 20 years after&nbsp;that, nevertheless killing around 386 people per year...
	</div>
	<div class="text years right line40">2060</div>
	<div class="line right line40"></div>
	<div class="horizontalLine full right line40"></div>
{/if}
{#if sixthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
	 	... and 19 days per year in the end of the&nbsp;century, killing around 2.442 people per year.
	</div>
	<div class="text years right line60">2080</div>
	<div class="line right line60"></div>
	<div class="horizontalLine full right line60"></div>
	<div class="text years right line80">2100</div>
	<div class="line right line80"></div>
	<div class="horizontalLine full right line80"></div>
{/if}



{#if tempMeter}
	<div class="tempMeter">
		{#if fifthSetup}<div class="temperature midMeter"><span class="deathToll text narrow">&#10013;&#xFE0E; 386</span></div>{/if}
		{#if sixthSetup}<div class="temperature endMeter"><span class="deathToll text narrow">&#10013;&#xFE0E; 2.442</span></div>{/if}
		<div class="temperature infotext">
			{#if fourthSetup}<span class="tempnumber right text">0 days</span>{/if}
			{#if fifthSetup}<span class="tempnumber rightMid text">2 days</span>{/if}
			{#if sixthSetup}<span class="tempnumber rightEnd text">19 days</span>{/if}
			<span class="tempnumber left text">365 days</span>
		</div>
	</div>
{/if}




{#if hotDays}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		{#if fifthSetup}
			<polyline class="cls-1" points="363 600 363 900 365 900 365 1200 365 1200 365 900 365 600"/>
		{:else}
			<polygon class="cls-1" points="365 1200 365 900 365 600 365 300 365 0 346 0 346 300 363 600 363 900 365 900 365 1200 365 1200"/>
		{/if}
	</svg>
{/if}




<!--<img src="https://dimg.donga.com/egc/CDB/CHINESE/Article/20/07/06/07/2007060738918.jpg">-->





<!--    FOOTER    -->

<div class="text bottomLine">
		<div class="bottomLineText text" style="text-align: right;">
			{#if secondSetup} <div>[from chat with Seojeong Youn]</div>{/if}
			{#if thirdSetup} <div>[from chat with Seojeong Youn]</div>{/if}
			{#if firstSetup}{:else}{#if secondSetup}{:else}{#if thirdSetup}{:else}
			<a target="_blank" href="http://www.impactlab.org/map/#usmeas=absolute&usyear=1981-2010&gmeas=absolute&gyear=2020-2039&tab=global&grcp=rcp85&gprob=0.5&gvar=tasmax-over-95F">[more &nearr;&#xFE0E;]</a>{/if}{/if}{/if}
		</div>
</div>


<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate}));"></div>
</div>






<style>
	.text, .text a, .pagetext/*, .pagetitle*/ {color: darkblue !important;}
	.horizontalLine {border-top: 1px dotted darkblue;}
	.line {background-color: darkblue;}
	.tempMeter {
		border-left: 1px solid /*rgb(70,70,70)*/ darkblue; 
		border-right: 1px solid /*rgb(70,70,70)*/ darkblue;
		background-color: rgba(0,0,0,0);
		width: calc(100vw - 4px);
		left: 0%;
	}
	.infotext {
		width: 100%; 
		background-color: rgba(0,0,0,0) !important; 
		border: none;
	}
	.cls-1, .hotDays {fill: white !important;}
	.midMeter, .endMeter {
		right: 0px;
		left: auto; 
		background-color: white !important; 
		border-top: 1px solid rgba(0,0,0,0); 
		border-bottom-right-radius: 20px; 
		border-top-right-radius: 20px;
		border-bottom-left-radius: 0px; 
		border-top-left-radius: 0px;
		border-left: 1px dotted darkblue;
	}
	.midMeter {width: calc(((100% / 365) * 2) - 1px); border: none;}
	.endMeter {width: calc(((100% / 365) * 19) - 1px);}
	.firstMeter:after, .midMeter:after, .endMeter:after {border-right: 1px dotted darkblue;}
	.rightMid {right: calc(((100vw / 365) * 2) - 1px);}
	.rightEnd {right: calc(((100vw / 365) * 19) - 1px);}

	.eraPhoto {
		background-size: contain !important;
		background-size: 60% !important;
		background-position: 10% 20%;
		/*background-image: url('https://lh3.googleusercontent.com/proxy/3szPE2OTXcgGTMWl72hiFAc7444IgpZ98gH8joKneVKL5kysG6ipruAmdkPYpNvmnJFO0VwckziwrtngPltCa48G7qcS8O0X5aGpTjglDuqcIm2c');
		background-image: url('../imgs/jukbuin light.png');*/
	}
	.eraPhoto2 {
		background-size: contain !important;
		background-size: 40% !important;
		width: 90vw !important;
		height: 97% !important;
		background-position: bottom right;
		/*background-image: url('https://png.pngtree.com/element_our/png_detail/20181123/traditional-korean-gourmet-chicken-soup-png_242812.jpg');
		background-image: url('../imgs/soup3.png');*/
	}


</style>