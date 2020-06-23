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
	let fourthSetup = false;
	let fourthText = false;
	let fourthLines = false;
	let fifthSetup = false;
	let sixthSetup = false;

	let fourthSticky = false;
	let fifthSticky = false;


	const togglefirstSetup = () => {
		firstSetup = true;
		secondSetup = false;
		seventyFive = false;
		secondLines = false;
	}
	const togglesecondSetup = () => {
		firstSetup = false;
		secondSetup = true;
		secondLines = true;
		thirdSetup = false;
		seventyFive = true;
	}
	const togglethirdSetup = () => {
		secondSetup = false;
		secondLines = true;
		thirdSetup = true;
		seventyFive = true;
		fourthSetup = false;
		fourthText = false;
		fourthLines = false;
		hotDays = false;
	}
	const togglefourthSetup = () => {
		thirdSetup = false;
		seventyFive = false;
		secondLines = true;
		fourthSetup = true;
		fourthText = true;
		fourthLines = true;
		fifthSetup = false;
		fourthSticky = true;
		fifthSticky = false;
	}
	const togglefifthSetup = () => {
		secondLines = true;
		fourthSetup = false;
		fourthText = true;
		fourthLines = true;
		fifthSetup = true;
		sixthSetup = false;
		fourthSticky = true;
		fifthSticky = true;
	}
	const togglesixthSetup = () => {
		secondLines = true;
		fourthText = true;
		fourthLines = true;
		fifthSetup = false;
		sixthSetup = true;
		fourthSticky = true;
		fifthSticky = true;
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





<!--    TEXT    -->

<div class="pagetitle" style="transform: rotate({rotate});">{pagetitleText}</div>
{#if firstSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		South-west of South Korea (not directly) is Cambodia, a former french colony which gained independance in&nbsp;1953.
	</div>	

	<img style="position: absolute; height: 20vw; right: 5%; bottom: 10%;" src="https://cdn1.i-scmp.com/sites/default/files/styles/1200x800/public/images/methode/2017/08/17/4b764522-818f-11e7-a767-bc310e55dd10_1280x720_145203.JPG?itok=-KNK72jk">
	<img style="position: absolute; width: 25%; left: 13%; top: 0%;" src="https://i.pinimg.com/564x/e2/95/98/e29598f213c862f21bf9e9b02d1a2587.jpg">
{/if}

{#if firstSetup}
{:else}
	<div class="prePics" style="top: calc({distanceBLines} * 0); left: calc({marginSides} + 5px);">
		<img class="smallPic" src="https://i.pinimg.com/564x/e2/95/98/e29598f213c862f21bf9e9b02d1a2587.jpg">
	</div>
	<div class="prePics" style="bottom: calc({distanceBLines} * .5); left: calc({marginSides} + 5px);">
		<img class="smallPic" src="https://cdn1.i-scmp.com/sites/default/files/styles/1200x800/public/images/methode/2017/08/17/4b764522-818f-11e7-a767-bc310e55dd10_1280x720_145203.JPG?itok=-KNK72jk">
	</div>
{/if}


{#if secondSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		In the years following Cambodia's independance, Cambodia's music and film industry took off. Influenced by the west, rock music became popular with stars such as <span style="font-family: arita;">រស់&nbsp;សេរីសុទ្ធា</span>, Ros&nbsp;Sereysothea, and <span style="font-family: arita;">ស៊ីន&nbsp;ស៊ីសាមុត</span>, Sinn&nbsp;Sisamouth.
	</div>

	<div class="horizontalLine left line60" style="width: 100%;"></div>
	<div class="text years left line60">1960</div>	

	<img style="position: absolute; width: 25%; left: 22%; top: 30%;" src="https://scontent-amt2-1.xx.fbcdn.net/v/t1.0-9/57407288_2227425770672919_6336639571349995520_o.jpg?_nc_cat=107&_nc_sid=8bfeb9&_nc_ohc=FD7UY8v07GYAX9lFo_d&_nc_ht=scontent-amt2-1.xx&oh=09b60e207ed1900b280264d73ed4ce73&oe=5F0CD97E">
	<img style="position: absolute; width: 25%; right: 2%; bottom: 3%;" src="https://i.pinimg.com/564x/e5/ea/52/e5ea5295c095e1f907de4df7c8c95c5d.jpg">
	<img style="position: absolute; width: 25%; right: 23%; bottom: 1%;" src="https://i.pinimg.com/originals/21/4e/2f/214e2fb4fb9a47147dac718f17ef4eef.jpg">
	<img style="position: absolute; width: 25%; left: 2%; bottom: 35%;" src="https://scontent-ams4-1.xx.fbcdn.net/v/t1.0-9/87072599_2806093836139440_6201700379038580736_o.jpg?_nc_cat=103&_nc_sid=8bfeb9&_nc_ohc=BKrGBjxdU_kAX9qajCI&_nc_ht=scontent-ams4-1.xx&oh=685a5f80c9b372c0250c745daf98254f&oe=5F0B1374">
	<img style="position: absolute; width: 25%; left: 15%; top: 5%;" src="http://img-196.uamulet.com/uauctions/AU383/2020/1/23/U18089286371538349680210271.jpg">
{/if}

{#if firstSetup}
{:else}
	{#if secondSetup}
	{:else}
		<div class="prePics" style="top: calc({distanceBLines} * 2.75); left: calc({marginSides} + 5px);">
			<img class="smallPic" src="http://img-196.uamulet.com/uauctions/AU383/2020/1/23/U18089286371538349680210271.jpg">
			<img class="smallPic" src="https://i.pinimg.com/564x/e5/ea/52/e5ea5295c095e1f907de4df7c8c95c5d.jpg">
			<img class="smallPic" src="https://i.pinimg.com/originals/21/4e/2f/214e2fb4fb9a47147dac718f17ef4eef.jpg">
		</div>
		<div class="prePics" style="bottom: calc({distanceBLines} * 4.25); left: calc({marginSides} + 5px);">
			<img class="smallPic" src="https://scontent-amt2-1.xx.fbcdn.net/v/t1.0-9/57407288_2227425770672919_6336639571349995520_o.jpg?_nc_cat=107&_nc_sid=8bfeb9&_nc_ohc=FD7UY8v07GYAX9lFo_d&_nc_ht=scontent-amt2-1.xx&oh=09b60e207ed1900b280264d73ed4ce73&oe=5F0CD97E">
			<img class="smallPic" src="https://scontent-ams4-1.xx.fbcdn.net/v/t1.0-9/87072599_2806093836139440_6201700379038580736_o.jpg?_nc_cat=103&_nc_sid=8bfeb9&_nc_ohc=BKrGBjxdU_kAX9qajCI&_nc_ht=scontent-ams4-1.xx&oh=685a5f80c9b372c0250c745daf98254f&oe=5F0B1374">
		</div>
	{/if}
{/if}


{#if seventyFive}
	<div class="horizontalLine left line45" style="width: 100%;"></div>
	<div class="text years left line45">1975</div>
{/if}


{#if thirdSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Following the Vietnam War (and subsequent bombings of Cambodia by the U.S. army), the Khmer Rouge, a nationalist communist party, took over and in the years 1975 to 1979 committed a mass genocide killing nearly two million Cambodian people. During that period most artists disappeared, including Ros&nbsp;Sereysothea and Sinn&nbsp;Sisamouth.
	</div><!--- LINK https://www.cambodiatribunal.org/history/cambodian-history/khmer-rouge-history/ -->

	<div class="horizontalLine left line41" style="width: 100%;"></div>
	<div class="text years left line41">1979</div>
	<div class="line left line41"></div>

	<img style="position: absolute; height: 40vw; right: 5%; top: 12%;" src="https://i1.trekearth.com/photos/86613/victims_of_khmer_rouge.jpg">	
{/if}


{#if firstSetup}
{:else}
	{#if secondSetup}
	{:else}
		{#if thirdSetup}
		{:else}
			<div class="prePics" style="bottom: calc({distanceBLines} * 3.9); left: calc({marginSides} + 5px);">
				<img class="smallPic" src="https://i1.trekearth.com/photos/86613/victims_of_khmer_rouge.jpg">
			</div>

			<div class="tempMeterCountry">
				<div class="temperature infotext">
					<span class="tempnumber left text" style="z-index: 99999999;">365 days</span>
				</div>
			</div>
		{/if}
	{/if}
{/if}

{#if fourthLines}
	<div class="line left line41"></div>
{/if}



{#if fourthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		Cambodia <!--has not seen the end of suffering, as it -->is one of the countries of the world that will feel the most extreme heat increase in the next decades due to man-made climate&nbsp;change. In the next two decades Cambodia will endure 34 additional extremely hot days resulting in around 2.414 deaths per year.
	</div>

	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polyline class="cls-1" points="331 900 331 1200 365 1200 365 900"/>
	</svg>
	<div class="tempMeterCountry">
		<div class="temperature firstMeter"><span class="deathToll text narrow">&#10013;&#xFE0E; 2.414</span></div>
		<div class="temperature infotext"><span class="tempnumber rightFirst text">34 days</span></div>
	</div>

	<div class="text years right line0 now">2020</div>
	<div class="horizontalLine full right line0"></div>
	<div class="text years right line20">2040</div>
	<div class="horizontalLine full right line20"></div>
{/if}

{#if fourthSticky}
	<!--<div class="line right line0"></div>
	<div class="line right line20"></div>-->
{/if}

{#if fifthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		In the next two decades the additional extremely hot days will have risen to 65 per year with a consequent additional 5.510 deaths per year.
	</div>

	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polyline class="cls-1" points="300 600 300 900 331 900 331 1200 365 1200 365 900 365 600"/>
	</svg>
	<div class="tempMeterCountry">
		<div class="temperature midMeter"><span class="deathToll text">&#10013;&#xFE0E; 5.510</span></div>
		<div class="temperature infotext"><span class="tempnumber rightMid text">65 days</span></div>
	</div>

	<div class="text years right line40">2060</div>
	<div class="horizontalLine full right line40"></div>
	<div class="text years right line20">2040</div>
	<div class="horizontalLine full right line20"></div>
{/if}

{#if fifthSticky}
	<!--<div class="line right line40"></div>-->
{/if}

{#if sixthSetup}
	<div class="pagetext" style="transform: rotate({rotate});">
		And the last decades of the century will have additional 181 extremely hot days a year. Meaning ca. half of the year will be dangerously hot, killing around 15.957 people per year.
	</div>

	<svg class="hotDays" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 365 1200" preserveAspectRatio="none">
		<polygon class="cls-1" points="365 1200 365 900 365 600 365 300 365 0 184 0 184 300 300 600 300 900 331 900 331 1200 365 1200"/>
	</svg>
	<div class="tempMeterCountry">
		<div class="temperature endMeter"><span class="deathToll text">&#10013;&#xFE0E; 15.957</span></div>
		<div class="temperature infotext"><span class="tempnumber rightEnd text">181 days</span></div>
	</div>

	<div class="text years right line60">2080</div>
	<div class="horizontalLine full right line60"></div>
	<div class="line right line60"></div>
	<div class="text years right line80">2100</div>
	<div class="horizontalLine full right line80"></div>
	<div class="line right line80"></div>
{/if}













{#if firstSetup}
	<div class="horizontalLine left line67" style="width: 100%;"></div>
	<div class="text years left line67">1953</div>	
{/if}
<div class="line left line67"></div>

{#if secondLines}
	<div class="line left line60"></div>
	<div class="line left line45"></div>
{/if}


<!--    Footer    -->

<div class="text bottomLine">
		<div class="bottomLineText text" style="text-align: right;">
			{#if secondSetup} <a target="_blank" href="https://vimeo.com/ondemand/dtif">[more &nearr;&#xFE0E;]</a> <a target="_blank" href="https://www.imdb.com/title/tt0069287/">[more &nearr;&#xFE0E;]</a>
			{/if}
			{#if thirdSetup} <a target="_blank" href="https://www.cambodiatribunal.org/history/cambodian-history/khmer-rouge-history/">[more &nearr;&#xFE0E;]</a>{/if}
			{#if fourthSetup}
				<a target="_blank" href="http://www.impactlab.org/map/#usmeas=absolute&usyear=1981-2010&gmeas=absolute&gyear=2020-2039&tab=global&grcp=rcp85&gprob=0.5&gvar=tasmax-over-95F">[more &nearr;&#xFE0E;]</a>
			{/if}
			{#if fifthSetup}
				<a target="_blank" href="http://www.impactlab.org/map/#usmeas=absolute&usyear=1981-2010&gmeas=absolute&gyear=2020-2039&tab=global&grcp=rcp85&gprob=0.5&gvar=tasmax-over-95F">[more &nearr;&#xFE0E;]</a>
			{/if}
			{#if sixthSetup}
				<a target="_blank" href="http://www.impactlab.org/map/#usmeas=absolute&usyear=1981-2010&gmeas=absolute&gyear=2020-2039&tab=global&grcp=rcp85&gprob=0.5&gvar=tasmax-over-95F">[more &nearr;&#xFE0E;]</a>
			{/if}

		</div>
</div>

<div class="activedotnew activedotFan">
	<div class="progressline" style="transform: rotate(calc(0deg - {rotate}));"></div>
</div>






<style>
	.text, .text a, .pagetext {color: darkblue !important;}
	.verticalLine {border-right: 1px dotted darkblue;}
	.horizontalLine {border-top: 1px dotted darkblue;}
	.line {background-color: darkblue;}

	.firstera {
		top: calc((100% - 1px) / 9 * 2); 
		bottom: calc((100% - 1px) / 9 * 6.6); 
		background-color: lightgreen;
		opacity: .3;
	}

	.eraPhoto {background-image: url('https://i.insider.com/5527ac2b6bb3f7ed2828a776?width=1300&format=jpeg&auto=webp');}
	.eraPhoto1 {background-image: contain !important; background-image: url('https://i.pinimg.com/564x/1e/f9/42/1ef9424c5ecdb0eef7ce46214b1ca24f.jpg');}
	.cls-1, .hotDays {fill: white !important;}

	.tempMeterCountry {
		border-left: 1px solid darkblue !important; 
		border-right: 1px solid darkblue !important;
	}
	.firstMeter, .midMeter, .endMeter {border-left: 1px dotted darkblue;}
	.firstMeter {width: calc(((100% / 365) * 34) - 0px);}
	.midMeter {width: calc(((100% / 365) * 65) - 0px);}
	.endMeter {width: calc(((100% / 365) * 181) - 0px);}
	
	.firstMeter:after, .midMeter:after, .endMeter:after {border-right: 1px dotted darkblue;}


	.rightFirst {right: calc(((100vw / 365) * 34) - 0px);}
	.rightMid {right: calc(((100vw / 365) * 65) - 0px);}
	.rightEnd {right: calc(((100vw / 365) * 181) - 0px);}

	.hotDays {z-index: 99998;}

</style>