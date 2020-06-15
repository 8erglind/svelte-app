<script>
	export let pagetitleText;
	export let rotate;
	export let next;
	export let prev;


	let distanceBLines = 'calc((100% - 1px) / 9 * 1)';
	let marginSides = 'calc(100vw / 16)';

	let firstSetup = true;
	let secondSetup = false;
	let secondLines = false;
	let thirdSetup = false;
	let seventyFive = false;
	let CambRock = false;
	let fourthSetup = false;
	let fourthText = false;
	let fourthLines = false;
	let fifthSetup = false;
	let sixthSetup = false;

	let fourthSticky = false;
	let fifthSticky = false;

	let hotDays = false;

	const togglehotDays = () => {
		hotDays = !hotDays;
	}

	const togglefirstSetup = () => {
		firstSetup = true;
		secondSetup = false;
		thirdSetup = false;
		seventyFive = false;
		CambRock = false;
		secondLines = false;
		fourthSetup = false;
		fourthText = false;
		fourthLines = false;
		hotDays = false;
		fifthSetup = false;
		sixthSetup = false;
		fourthSticky = false;
		fifthSticky = false;
	}
	const togglesecondSetup = () => {
		firstSetup = false;
		secondSetup = true;
		thirdSetup = false;
		seventyFive = true;
		CambRock = true;
		secondLines = true;
		fourthSetup = false;
		fourthText = false;
		fourthLines = false;
		hotDays = false;
		fifthSetup = false;
		sixthSetup = false;
		fourthSticky = false;
		fifthSticky = false;
	}
	const togglethirdSetup = () => {
		firstSetup = false;
		secondSetup = false;
		thirdSetup = true;
		seventyFive = true;
		CambRock = false;
		secondLines = true;
		fourthSetup = false;
		fourthText = false;
		fourthLines = false;
		hotDays = false;
		fifthSetup = false;
		sixthSetup = false;
		fourthSticky = false;
		fifthSticky = false;
	}
	const togglefourthSetup = () => {
		firstSetup = false;
		secondSetup = false;
		thirdSetup = false;
		seventyFive = false;
		CambRock = false;
		secondLines = true;
		fourthSetup = true;
		fourthText = true;
		fourthLines = true;
		hotDays = true;
		fifthSetup = false;
		sixthSetup = false;
		fourthSticky = true;
		fifthSticky = false;
	}
	const togglefifthSetup = () => {
		firstSetup = false;
		secondSetup = false;
		thirdSetup = false;
		seventyFive = false;
		CambRock = false;
		secondLines = true;
		fourthSetup = false;
		fourthText = true;
		fourthLines = true;
		hotDays = true;
		fifthSetup = true;
		sixthSetup = false;
		fourthSticky = true;
		fifthSticky = true;
	}
	const togglesixthSetup = () => {
		firstSetup = false;
		secondSetup = false;
		thirdSetup = false;
		seventyFive = false;
		CambRock = false;
		secondLines = true;
		fourthSetup = false;
		fourthText = true;
		fourthLines = true;
		hotDays = true;
		fifthSetup = false;
		sixthSetup = true;
		fourthSticky = true;
		fifthSticky = true;
	}




	//import TimelinesEmpty from './TimelineEmpty.svelte';
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





<!--    TEXT    -->

<div class="pagetitle" style="transform: rotate({rotate});">{pagetitleText}</div>
{#if firstSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Travelling on west (and south) from S-Korea, we reach Cambodia, a former french colony which gained independance in 1953.
	</div>
	<!--<iframe style="position: absolute; left: 10%; width: 20vw; height: 20vw; bottom: calc({distanceBLines} * 4);" src="https://www.youtube.com/embed/eDv6yaNUZYc?controls=0&amp;start=10" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>-->

	<img style="position: absolute; height: 20vw; right: 5%; bottom: 10%;" src="https://cdn1.i-scmp.com/sites/default/files/styles/1200x800/public/images/methode/2017/08/17/4b764522-818f-11e7-a767-bc310e55dd10_1280x720_145203.JPG?itok=-KNK72jk">

	<img style="position: absolute; width: 25%; left: 13%; top: 0%;" src="https://i.pinimg.com/564x/e2/95/98/e29598f213c862f21bf9e9b02d1a2587.jpg">

	<!--<img style="position: absolute; width: 25%; left: 3%; bottom: 35%;" src="https://i.pinimg.com/564x/c3/4a/e1/c34ae1670daa741cab865f26116620c9.jpg">
	<img style="position: absolute; width: 25%; left: 3%; bottom: 35%;" src="https://i.pinimg.com/564x/3b/1c/67/3b1c677bf388c9c4fab55ba00700d6e8.jpg">-->	
{/if}


{#if secondSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		In the following years, Cambodia's music and film industry took off with stars such as <span style="font-family: arita;">រស់&nbsp;សេរីសុទ្ធា</span> (Ros&nbsp;Sereysothea) and <span style="font-family: arita;">ស៊ីន&nbsp;ស៊ីសាមុត</span> (Sinn&nbsp;Sisamouth).
	</div>

	<!--<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/133659972?autoplay=1&title=0&byline=0&portrait=0" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>-->

	<img style="position: absolute; width: 25%; left: 22%; top: 30%;" src="https://scontent-amt2-1.xx.fbcdn.net/v/t1.0-9/57407288_2227425770672919_6336639571349995520_o.jpg?_nc_cat=107&_nc_sid=8bfeb9&_nc_ohc=FD7UY8v07GYAX9lFo_d&_nc_ht=scontent-amt2-1.xx&oh=09b60e207ed1900b280264d73ed4ce73&oe=5F0CD97E">

	<img style="position: absolute; width: 25%; right: 2%; bottom: 3%;" src="https://i.pinimg.com/564x/e5/ea/52/e5ea5295c095e1f907de4df7c8c95c5d.jpg">

	<img style="position: absolute; width: 25%; right: 23%; bottom: 1%;" src="https://i.pinimg.com/originals/21/4e/2f/214e2fb4fb9a47147dac718f17ef4eef.jpg">

	<img style="position: absolute; width: 25%; left: 2%; bottom: 35%;" src="https://scontent-ams4-1.xx.fbcdn.net/v/t1.0-9/87072599_2806093836139440_6201700379038580736_o.jpg?_nc_cat=103&_nc_sid=8bfeb9&_nc_ohc=BKrGBjxdU_kAX9qajCI&_nc_ht=scontent-ams4-1.xx&oh=685a5f80c9b372c0250c745daf98254f&oe=5F0B1374">

	<img style="position: absolute; width: 25%; left: 15%; top: 5%;" src="http://img-196.uamulet.com/uauctions/AU383/2020/1/23/U18089286371538349680210271.jpg">

	<div class="horizontalLine left line60" style="width: 100%;"></div>
	<div class="text years left line60">1960</div>	


	<!--<img style="position: absolute; width: 25%; left: 2%; bottom: 35%;" src="https://lastfm.freetls.fastly.net/i/u/770x0/32806982967ca8e6e7f97ba67f184f4d.webp#32806982967ca8e6e7f97ba67f184f4d">-->
	
{/if}

{#if seventyFive}
	<div class="horizontalLine left line45" style="width: 100%;"></div>
	<div class="text years left line45">1975</div>
{/if}


{#if thirdSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Following the Vietnam War (and subsequent bombings of Cambodia by the U.S. army), the Khmer Rouge, a nationalist communist party, took over and in the years 1975 to 1979 committed a mass genocide killing nearly two million Cambodian people. During that period most artists disappeared, two of them <span style="font-family: arita;">រស់&nbsp;សេរីសុទ្ធា</span> and&nbsp;<span style="font-family: arita;">ស៊ីន&nbsp;ស៊ីសាមុត</span>.
	</div><!--- LINK https://www.cambodiatribunal.org/history/cambodian-history/khmer-rouge-history/ -->

	<img style="position: absolute; height: 50vw; right: 5%; top: 2%;" src="https://i1.trekearth.com/photos/86613/victims_of_khmer_rouge.jpg">	


	<div class="horizontalLine left line41" style="width: 100%;"></div>
	<div class="text years left line41">1979</div>
	<div class="line left line41"></div>
{/if}

{#if fourthLines}
	<div class="line left line41"></div>
{/if}



<!--    Graph    -->
{#if hotDays}
	<div class="hideHotdays criticalText" style="position: absolute; text-align: right; bottom: calc({distanceBLines} * 8); right: 5px; color: /*rgb(230,230,230)*/ white; z-index: 999999999999999999999999999999999;" on:click={togglehotDays}>hide</div>

	<div class="tempMeter">
		<div class="temperature infotext">
			<span class="tempnumber left text">365 days</span>
		</div>
	</div>
{/if}




{#if fourthText}
	<div class="pagetext" style="transform: rotate({rotate});">
		Cambodia has not seen the end of suffering, as it is one of the countries of the world that will feel the most extreme heat increase in the next decades due to man-made climate&nbsp;change.
	</div>
{/if}


{#if fourthSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polyline class="cls-1" points="331 900 331 1200 365 1200 365 900"/>
	</svg>
	<div class="tempMeter">
		<div class="temperature firstMeter"></div>
		<div class="temperature infotext">
			<span class="tempnumber rightFirst text">34 days</span>
		</div>
	</div>

	<div class="text years right line0">2020</div>
	<div class="horizontalLine full right line0"></div>
	<div class="text years right line20">2040</div>
	<div class="horizontalLine full right line20"></div>
{/if}

{#if fourthSticky}
	<div class="line right line0"></div>
	<div class="line right line20"></div>
{/if}

{#if fifthSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polyline class="cls-1" points="300 600 300 900 331 900 331 1200 365 1200 365 900 365 600"/>
	</svg>
	<div class="tempMeter">
		<div class="temperature midMeter"></div>
		<div class="temperature infotext">
			<span class="tempnumber rightMid text">65 days</span>
		</div>
	</div>

	<div class="text years right line40">2060</div>
	<div class="horizontalLine full right line40"></div>

	<div class="text years right line20">2040</div>
	<div class="horizontalLine full right line20"></div>
{/if}

{#if fifthSticky}
	<div class="line right line40"></div>
{/if}

{#if sixthSetup}
	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200 365 900 365 600 365 300 365 0 184 0 184 300 300 600 300 900 331 900 331 1200 365 1200"/>
	</svg>
	<div class="tempMeter">
		<div class="temperature endMeter"></div>
		<div class="temperature infotext">
			<span class="tempnumber rightEnd text">181 days</span>
		</div>
	</div>

	<div class="text years right line60">2080</div>
	<div class="horizontalLine full right line60"></div>
	<div class="line right line60"></div>
	<div class="text years right line80">2100</div>
	<div class="horizontalLine full right line80"></div>
	<div class="line right line80"></div>
{/if}






<div class="text bottomLine">
		<div class="bottomLineText" style="text-align: right;">
			Sources [1], [2], [3].
		</div>
</div>











<!--    CONTENT    -->

<!--<div class="horizontalLine left" style="width: 100%; top: calc(({distanceBLines} * 8) - 1px); border-top: 1px solid blue;"></div>-->

<!--
	<div class="horizontalLine left line45" style="width: 100%;"></div>
	<div class="text years left line45">1975</div>

	<div class="horizontalLine left line70" style="width: 100%;"></div>
	<div class="era firstera"></div>
	<div class="text years left line70">1950</div>
	<div class="text years left line66">1954</div>
	<div class="horizontalLine left line66" style="width: 100%;"></div>
-->

{#if firstSetup}
	<div class="horizontalLine left line67" style="width: 100%;"></div>
	<div class="text years left line67">1953</div>	
{/if}
<div class="line left line67"></div>
{#if CambRock}
	<!--<div class="eraPhoto eraPhoto1"></div>-->
{/if}
{#if secondLines}
	<div class="line left line60"></div>
	<div class="line left line45"></div>
{/if}
<!--{#if secondSetup}
	<div class="horizontalLine left line50" style="width: 100%;"></div>
	<div class="text years left line50">1970</div>

	
{/if}
{#if thirdSetup}
	<div class="eraPhoto"></div>
	<div class="horizontalLine left line50" style="width: 100%;"></div>
	<div class="text years left line50">1970</div>
{/if}-->



<!--    Footer    -->

<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate} + 11.25deg));"></div>
</div>






<style>

	.text {color: green;}
	.verticalLine {border-right: 1px dotted green;}
	.horizontalLine {border-top: 1px dotted green;}
	.line {background-color: green;}

	.firstera {
		top: calc((100% - 1px) / 9 * 2); 
		bottom: calc((100% - 1px) / 9 * 6.6); 
		background-color: lightgreen;
		opacity: .3;
	}

	.eraPhoto {background-image: url('https://i.insider.com/5527ac2b6bb3f7ed2828a776?width=1300&format=jpeg&auto=webp');}
	.eraPhoto1 {background-image: contain !important; background-image: url('https://i.pinimg.com/564x/1e/f9/42/1ef9424c5ecdb0eef7ce46214b1ca24f.jpg');}
	.cls-1, .hotDays {fill: beige !important;}

	.tempMeter {
		border-left: 1px solid /*rgb(70,70,70)*/ green; 
		border-right: 1px solid /*rgb(70,70,70)*/ green;
		/*background-color: rgba(0,0,0,0);*/
		width: calc(100vw - 4px);
		left: 0%;
	}
	.infotext {
		width: 100%; 
		background-color: rgba(0,0,0,0) !important; 
		border: none;
	}
	.firstMeter, .midMeter, .endMeter {
		right: 0px;
		left: auto; 
		background-color: rgb(230,230,230) !important; 
		border-top: 1px solid rgba(0,0,0,0); 
		border-bottom-right-radius: 20px; 
		border-top-right-radius: 20px;
		border-bottom-left-radius: 0px; 
		border-top-left-radius: 0px;
		border-left: 1px dotted green;
	}
	.firstMeter {width: calc(((100% / 365) * 34) - 1px);}
	.midMeter {width: calc(((100% / 365) * 65) - 1px);}
	.endMeter {width: calc(((100% / 365) * 181) - 1px);}
	/*.cls-1 {fill: beige !important;}*/
	.rightFirst {right: calc(((100vw / 365) * 34) - 1px);}
	.rightMid {right: calc(((100vw / 365) * 65) - 1px);}
	.rightEnd {right: calc(((100vw / 365) * 181) - 1px);}

</style>